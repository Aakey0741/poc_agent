const { InferenceClient } = require("@huggingface/inference");
const dotenv = require("dotenv")
dotenv.config()

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

const client = new InferenceClient(HF_API_KEY);

(async () => {
    const response = await client.chatCompletion({
        model: HF_MODEL,
        messages: [{ role: "user", content: "What is mutual funds?" }],
        max_tokens: 200,
    });

    console.log(response);
    console.log(response.choices[0].message.content);
})();
