import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;

async function run() {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: "Generate a fake employee JSON profile" }),
        }
    );
    console.log({response})
    // const result = await response.json();`
    // console.log("👉 Hugging Face response:", result);
}

run();
