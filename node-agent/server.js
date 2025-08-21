import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getProducts, getUser } from "./tools.js";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Chat Endpoint (non-stream) ---
app.post("/chat", async (req, res) => {
    const { message, user_id } = req.body;

    // Simple rule-based before LLM
    if (message.toLowerCase().includes("product")) {
        const items = await getProducts({});
        return res.json({ answer: "Products:\n" + items.map(i => `- ${i.name} (₹${i.price})`).join("\n") });
    }
    if (message.toLowerCase().includes("user") && user_id) {
        const user = await getUser({ id: user_id });
        return res.json({ answer: user ? `User: ${user.name} (tier: ${user.tier})` : "User not found" });
    }

    // Otherwise use OpenAI
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are Broco, an AI agent who helps fetch data or answer clearly." },
            { role: "user", content: message }
        ]
    });

    res.json({ answer: response.choices[0].message.content });
});

// --- Chat Stream (typing effect) ---
app.post("/chat/stream", async (req, res) => {
    const { message } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are Broco, an AI agent that streams answers token by token." },
            { role: "user", content: message }
        ],
        stream: true
    });

    for await (const chunk of completion) {
        const token = chunk.choices[0]?.delta?.content || "";
        if (token) {
            res.write(`data: ${token}\n\n`);
        }
    }
    res.write("data: [DONE]\n\n");
    res.end();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Node Agent running on port ${PORT}`));
