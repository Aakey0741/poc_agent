const fetch = require("node-fetch");
const dotenv = require("dotenv")
dotenv.config()

const HF_API_KEY = process.env.HF_API_KEY;
console.log(HF_API_KEY)
const HF_MODEL = "facebook/opt-350m";

async function askHuggingFace(prompt) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 100,   // OpenAI ke "max_tokens" jaisa
                temperature: 0.7       // randomness control
            }
        }),
    });
    console.log(response)
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || "No output";
}

// Test Run
(async () => {
    try {
        const answer = await askHuggingFace("What is AUM in finance?");
        console.log("🤖 HuggingFace Response:\n", answer);
    } catch (err) {
        console.error("❌ Error:", err);
    }
})();