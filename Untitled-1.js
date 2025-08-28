// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// MongoDB Connection URI. Replace with your actual MongoDB URI.
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToDb() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

// Ensure database connection is ready before starting the server
connectToDb().then(() => {
  // Use EJS for templating
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.json());
  app.use(express.static('public'));

  app.get('/', (req, res) => {
    res.render('index', { title: 'AI Agent' });
  });

  app.post('/ask', async (req, res) => {
    const userPrompt = req.body.prompt;
    console.log(`Received user prompt: "${userPrompt}"`);

    // Simulate calling an LLM (in this case, I am the LLM!)
    // This is the core logic where the AI decides the query.
    // In a real-world scenario, you would make an API call to a model like Gemini.
    // The response is a structured JSON object.
    const llmDecision = await getLlmDecision(userPrompt);

    if (!llmDecision || !llmDecision.action || !llmDecision.action.collection || !llmDecision.action.query) {
      return res.status(400).json({ error: 'LLM did not provide a valid action. Please rephrase your query.' });
    }

    const { collection, query } = llmDecision.action;
    let finalResult = null;

    try {
      const database = client.db("AgentDB");
      const dbCollection = database.collection(collection);

      // Execute the query based on the LLM's decision
      if (query.type === 'find') {
        const projection = query.projection || {};
        finalResult = await dbCollection.find(query.filter || {}, { projection }).toArray();
      } else if (query.type === 'aggregate') {
        finalResult = await dbCollection.aggregate(query.pipeline || []).toArray();
      } else if (query.type === 'insert') {
        finalResult = await dbCollection.insertOne(query.document);
      } else {
        return res.status(400).json({ error: `Unsupported query type: ${query.type}` });
      }

      // Format the response and send it back to the client
      res.json({
        prompt: userPrompt,
        result: finalResult,
        queryExecuted: query,
        collectionUsed: collection
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.status(500).json({ error: 'An error occurred during the database query.' });
    }
  });

  app.listen(port, () => {
    console.log(`AI Agent server listening at http://localhost:${port}`);
  });
});

/**
 * Simulates a Large Language Model (LLM) decision-making process.
 * In a real application, this would be an API call to a service like Gemini.
 * The model's response is a structured JSON object that the server can parse.
 * @param {string} prompt The user's input prompt.
 * @returns {object} A structured JSON object containing the action.
 */
async function getLlmDecision(prompt) {
  prompt = prompt.toLowerCase();
  let decision = {};

  if (prompt.includes('users') && prompt.includes('all')) {
    decision = {
      action: {
        collection: 'users',
        query: {
          type: 'find',
          filter: {},
          projection: { _id: 0 }
        }
      }
    };
  } else if (prompt.includes('user') && (prompt.includes('email') || prompt.includes('id'))) {
    const emailMatch = prompt.match(/\S+@\S+/);
    const userIdMatch = prompt.match(/id:\s*(\w+)/);
    let filter = {};
    if (emailMatch) {
      filter.email = emailMatch[0];
    } else if (userIdMatch) {
      filter._id = userIdMatch[1];
    }

    decision = {
      action: {
        collection: 'users',
        query: {
          type: 'find',
          filter: filter,
          projection: { _id: 0 }
        }
      }
    };
  } else if (prompt.includes('products') && prompt.includes('price')) {
    const priceMatch = prompt.match(/over \$(\d+)/);
    let filter = {};
    if (priceMatch) {
      filter.price = { $gt: parseFloat(priceMatch[1]) };
    }
    decision = {
      action: {
        collection: 'products',
        query: {
          type: 'find',
          filter: filter,
          projection: { _id: 0 }
        }
      }
    };
  } else if (prompt.includes('orders') && prompt.includes('total')) {
    decision = {
      action: {
        collection: 'orders',
        query: {
          type: 'aggregate',
          pipeline: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
              }
            },
            {
              $project: { _id: 0 }
            }
          ]
        }
      }
    };
  } else {
    // Default response for unhandled prompts
    decision = {
      action: {
        collection: 'unhandled',
        query: {
          type: 'unsupported'
        }
      }
    };
  }

  return decision;
}


// views/index.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f3f4f6;
    }
  </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-2">AI Agent Chat</h1>
      <p class="text-gray-500">Ask the agent to query the database. Try queries like "show me all users" or "how many total orders were placed?".</p>
    </div>

    <div id="chat-container" class="bg-gray-50 border border-gray-200 rounded-xl h-96 overflow-y-auto p-4 space-y-4">
      <div class="flex items-start space-x-2">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
        <div class="bg-blue-100 text-blue-800 p-3 rounded-xl max-w-[80%] break-words">
          <p>Hello! I am an AI Agent connected to a database. How can I help you?</p>
        </div>
      </div>
    </div>

    <div class="flex space-x-4">
      <input id="prompt-input" type="text" placeholder="Enter your query..." class="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">
      <button id="send-btn" class="bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>

    <div id="loading-spinner" class="hidden text-center text-blue-500">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
      <p class="mt-2">Agent is thinking...</p>
    </div>

    <!-- Modal for displaying structured data -->
    <div id="data-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-2xl bg-white">
        <div class="text-right">
          <button id="close-modal-btn" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <h3 class="text-xl font-bold mb-4">Query Result</h3>
        <pre id="modal-content" class="bg-gray-100 p-4 rounded-xl overflow-x-auto text-sm"></pre>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const promptInput = document.getElementById('prompt-input');
      const sendBtn = document.getElementById('send-btn');
      const chatContainer = document.getElementById('chat-container');
      const loadingSpinner = document.getElementById('loading-spinner');
      const dataModal = document.getElementById('data-modal');
      const modalContent = document.getElementById('modal-content');
      const closeModalBtn = document.getElementById('close-modal-btn');

      // Helper function to append a message to the chat
      function appendMessage(sender, message) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2`;

        if (sender === 'user') {
          messageWrapper.innerHTML = `
            <div class="bg-blue-600 text-white p-3 rounded-xl max-w-[80%] break-words">
              <p>${message}</p>
            </div>
          `;
        } else {
          messageWrapper.innerHTML = `
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
            <div class="bg-blue-100 text-blue-800 p-3 rounded-xl max-w-[80%] break-words">
              <p>${message}</p>
            </div>
          `;
        }
        chatContainer.appendChild(messageWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      // Helper function to show the modal
      function showModal(data) {
        modalContent.textContent = JSON.stringify(data, null, 2);
        dataModal.classList.remove('hidden');
      }

      // Helper function to hide the modal
      function hideModal() {
        dataModal.classList.add('hidden');
      }

      // Event listener for the send button
      sendBtn.addEventListener('click', async () => {
        const userPrompt = promptInput.value.trim();
        if (!userPrompt) {
          return;
        }

        appendMessage('user', userPrompt);
        promptInput.value = '';
        loadingSpinner.classList.remove('hidden');

        try {
          const response = await fetch('/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userPrompt }),
          });

          const data = await response.json();

          if (response.ok) {
            appendMessage('agent', 'Here is the data I found:');
            showModal(data.result);
          } else {
            appendMessage('agent', `Error: ${data.error}`);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          appendMessage('agent', 'Sorry, something went wrong. Please try again later.');
        } finally {
          loadingSpinner.classList.add('hidden');
        }
      });

      // Event listener for the modal close button
      closeModalBtn.addEventListener('click', hideModal);

      // Close modal on outside click
      window.addEventListener('click', (event) => {
        if (event.target === dataModal) {
          hideModal();
        }
      });
    });
  </script>
</body>
</html>

