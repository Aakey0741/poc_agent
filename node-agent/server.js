
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// import { getProducts, getUser } from "./tools.js";
const { find_all } = require("./crud")
// import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Chat Endpoint (non-stream) ---
// app.post("/chat", async (req, res) => {
//     const { message, user_id } = req.body;

//     // Simple rule-based before LLM
//     if (message.toLowerCase().includes("product")) {
//         const items = await getProducts({});
//         return res.json({ answer: "Products:\n" + items.map(i => `- ${i.name} (₹${i.price})`).join("\n") });
//     }
//     if (message.toLowerCase().includes("user") && user_id) {
//         const user = await getUser({ id: user_id });
//         return res.json({ answer: user ? `User: ${user.name} (tier: ${user.tier})` : "User not found" });
//     }

//     // Otherwise use OpenAI
//     const response = await client.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//             { role: "system", content: "You are Broco, an AI agent who helps fetch data or answer clearly." },
//             { role: "user", content: message }
//         ]
//     });

//     res.json({ answer: response.choices[0].message.content });
// });

// // --- Chat Stream (typing effect) ---
// app.post("/chat/stream", async (req, res) => {
//     const { message } = req.body;
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     const completion = await client.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//             { role: "system", content: "You are Broco, an AI agent that streams answers token by token." },
//             { role: "user", content: message }
//         ],
//         stream: true
//     });

//     for await (const chunk of completion) {
//         const token = chunk.choices[0]?.delta?.content || "";
//         if (token) {
//             res.write(`data: ${token}\n\n`);
//         }
//     }
//     res.write("data: [DONE]\n\n");
//     res.end();
// });

setTimeout(async () => {
    const need = 'aum';
    let modelName = '';
    let select = {};
    switch (need) {
        case 'aum':
            modelName = 'present_day_summary'
            select = { cur_val: 1, _id: 0 }
            break;

        case 'trnsactions':
            modelName = 'transaction_batch'
            break;

        case 'info':
            modelName = 'client_batch'
            break;

        default:
            break;
    }
    const client_info = await find_all({
        modelName,
        where: { arn_id: 8 },
        select
    });
    // console.log(client_info.length)
    // console.table(client_info)
    let calculated_aum = 0;
    if (client_info.length > 0) {
        switch (need) {
            case 'aum':
                // modelName = 'present_day_summary'
                for (let single of client_info) {
                    calculated_aum = parseFloat(calculated_aum) + parseFloat(single.cur_val ? single?.cur_val : 0);
                }
                console.log(calculated_aum);
                break;

            case 'trnsactions':
                modelName = 'transaction_batch'
                break;

            case 'info':
                modelName = 'client_batch'
                break;

            default:
                break;
        }
    }
}, 2000);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Node Agent running on port ${PORT}`));
