const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { AIMessage, HumanMessage } = require("@langchain/core/messages");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { StateGraph, Annotation } = require("@langchain/langgraph");
const { tool } = require("@langchain/core/tools");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { MongoDBSaver } = require("@langchain/langgraph-checkpoint-mongodb");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { z } = require("zod");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callAiAgent(client, query, thread_id) {
    const dbName = "hr_demo";
    const db = client.db(dbName);
    const collection = db.collection("employees");

    const GraphState = Annotation.Root({
        messages: Annotation({
            reducer: (x, y) => x.concat(y),
        }),
    });

    // Tool with Gemini embeddings
    const employeeLookupTool = tool(
        async ({ query, n = 10 }) => {
            console.log("🔍 Employee lookup tool called with query:", query);
            try {
                const dbConfig = {
                    collection: collection,
                    indexName: "vector_index",
                    textKey: "embedding_text",
                    embeddingKey: "embedding",
                };

                // Gemini embeddings instead of OpenAI
                const vectorStore = new MongoDBAtlasVectorSearch(
                    new GoogleGenerativeAIEmbeddings({
                        model: "models/text-embedding-004", // Gemini embedding model
                        apiKey: GEMINI_API_KEY,
                    }),
                    dbConfig
                );

                const result = await vectorStore.similaritySearchWithScore(query, n);
                if (!result || result.length === 0) {
                    return "No matching employees found.";
                }
                return JSON.stringify(result, null, 2)
                return JSON.stringify(result);
            } catch (err) {
                console.error("❌ Employee lookup error:", err.message);
                return `Error fetching employee details: ${err.message}`;
            }
        },
        {
            name: "employee_lookup",
            description: "Gathers employee details from the HR database using semantic search",
            schema: z.object({
                query: z.string().describe("The search query (e.g., employee name or role)"),
                n: z.number().optional().default(10).describe("Number of results to return"),
            }),
        }
    );

    const tools = [employeeLookupTool];
    const toolNode = new ToolNode(tools);

    // Gemini model instead of Anthropic
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",//"gemini-1.5-pro", // you can also try gemini-1.5-flash (faster & cheaper)
        apiKey: GEMINI_API_KEY,
        temperature: 0,
        maxOutputTokens: 800,
    }).bindTools(tools);

    function shouldContinue(state) {
        const messages = state.messages;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.tool_calls?.length) {
            return "tools";
        }
        return "__end__";
    }

    async function callModel(state) {
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful AI assistant, collaborating with other assistants. Use the provided tools to progress towards answering the question. If you are unable to fully answer, that's OK, another assistant with different tools will help where you left off. Execute what you can to make progress. If you or any of the other assistants have the final answer or deliverable, prefix your response with FINAL ANSWER so the team knows to stop. You have access to the following tools: {tool_names}.\n{system_message}\nCurrent time: {time}.`,
            ],
            new MessagesPlaceholder("messages"),
        ]);

        const formattedPrompt = await prompt.formatMessages({
            system_message: "You are helpful HR Chatbot Agent.",
            time: new Date().toISOString(),
            tool_names: tools.map((tool) => tool.name).join(", "),
            messages: state.messages,
        });

        const result = await model.invoke(formattedPrompt);

        return { messages: [result] };
    }

    const workflow = new StateGraph(GraphState)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent");

    const checkpointer = new MongoDBSaver({ client, dbName });

    const app = workflow.compile({ checkpointer });

    if (!query || query.trim() === "") {
        throw new Error("Query is empty. Please provide some input text.");
    }

    const finalState = await app.invoke(
        {
            messages: [new HumanMessage({
                content: query,
                additional_kwargs: {}   // 👈 must be provided (even if empty)
            })],
        },
        { recursionLimit: 15, configurable: { thread_id: thread_id } }
    );

    console.log(finalState.messages[finalState.messages.length - 1].content);

    return finalState.messages[finalState.messages.length - 1].content;
}

module.exports = { callAiAgent };
