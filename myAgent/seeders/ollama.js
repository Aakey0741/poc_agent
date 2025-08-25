// ollamaTest.js
const fetch = require("node-fetch");

async function askOllama(prompt) {
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "mistral",   // ya "llama2", "gemma" etc.
            prompt: prompt,
            stream: false       // agar streaming chahiye to true
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
}

// Test Run
(async () => {
    try {
        const answer = await askOllama("Explain AUM in finance in simple terms.");
        console.log("🤖 Ollama Response:\n", answer);
    } catch (err) {
        console.error("❌ Error:", err);
    }
})();
