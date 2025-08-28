const dotenv = require("dotenv")
const express = require("express")
const { MongoClient } = require("mongodb")
const { callAiAgent } = require("./agent_tool")

const app = express()
app.use(express.json())

dotenv.config();

const MONGODB_URI = process.env.MONGODB_ATLAS_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const client = new MongoClient(MONGODB_URI);

const startServer = async () => {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        // process.exit(0);

        app.get('/', async (req, res) => {
            console.log("Base route hitted..")
            res.send('LangGraph Agent Server')
        })

        app.post('/chat', async (req, res) => {
            const initialMsg = req.body.message
            const threadId = Date.now().toString();
            try {
                const response = await callAiAgent(client, initialMsg, threadId);
                res.json({ threadId, response });
            } catch (error) {
                console.error('Error starting conversation:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        })

        app.post('/chat/:threadId', async (req, res) => {
            const { threadId } = req.params
            const msg = req.body.message
            try {
                const response = await callAiAgent(client, msg, threadId);
                res.json({ response });
            } catch (error) {
                console.error('Error in chat:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        })

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.log('Error connecting to MongoDB : ', error)
    }
}

startServer()