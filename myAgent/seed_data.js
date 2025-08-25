const { MongoClient } = require("mongodb")
const dotenv = require("dotenv")
const { z } = require("zod")
const { StructuredOutputParser } = require("@langchain/core/output_parsers")
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")

dotenv.config();

const MONGODB_URI = process.env.MONGODB_ATLAS_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const client = new MongoClient(MONGODB_URI);

// ✅ Zod schema for employee
const employeeSchema = z.object({
    employee_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    date_of_birth: z.string(),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string(),
    }),
    contact_details: z.object({
        email: z.string(),
        phone_number: z.string(),
    }),
    job_details: z.object({
        job_title: z.string(),
        department: z.string(),
        hire_date: z.string(),
        employment_type: z.string(),
        salary: z.number(),
        currency: z.string(),
    }),
    work_location: z.string(),
    benefits: z.object({
        health_insurance: z.string(),
        retirement_plan: z.string(),
        paid_time_off: z.number(),
    }),
    emergency_contact: z.object({
        name: z.string(),
        relationship: z.string(),
        phone_number: z.string(),
    }),
    notes: z.string(),
});

// const parser = StructuredOutputParser.fromZodSchema(employeeSchema);
const parser = StructuredOutputParser.fromZodSchema(z.array(employeeSchema));

// ✅ Gemini Model
async function generateSyntheticData() {
    // console.log({
    //     model: "gemini-1.5-pro", // you can also try gemini-1.5-flash (faster & cheaper)
    //     apiKey: GEMINI_API_KEY,
    //     temperature: 0.7,
    //     maxOutputTokens: 800,
    // });
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",//"gemini-1.5-pro", // you can also try gemini-1.5-flash (faster & cheaper)
        apiKey: GEMINI_API_KEY,
        temperature: 0.7,
        maxOutputTokens: 800,
    });

    const prompt = `Generate a two fake employee record strictly in JSON format. Follow this schema: ${parser.getFormatInstructions()}`;
    // const prompt = `You are a helpful assistant that generates employee data. Generate 1 fictional employee records. Each record should include the following this schema: ${parser.getFormatInstructions()}`;
    // const prompt = new PromptTemplate({
    // template: "Generate employee data strictly in JSON format, no explanations. {format_instructions}",
    // inputVariables: [],
    // partialVariables: { format_instructions: parser.getFormatInstructions() }
    // });
    const response = await model.invoke(prompt);
    // const text = response.content; // Gemini returns structured content
    // console.log({ response, text })
    const rawText = response.content;
    // console.log({ rawText })

    // 1. Strip markdown fences if present
    let cleaned = rawText.replace(/```json|```/g, "").trim();

    // 2. Try to parse JSON
    // let doc;
    // try {
    //     doc = JSON.parse(cleaned);
    // } catch (err) {
    //     console.error("❌ Failed to parse JSON:", cleaned);
    //     throw err;
    // }

    console.log("✅ cleaned data:", cleaned);
    const parsed = await parser.parse(cleaned);
    return parsed;
}

// ✅ Seeder function
async function seedDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");
        const db = client.db("hr_demo");
        const employees = db.collection("employees");

        console.log("⚡ Generating synthetic data with Gemini...");
        const records = await generateSyntheticData();

        console.log({ records })

        for (let record of records) {
            await employees.insertOne(record);
            console.log("✅ Inserted employee:", record.first_name, record.last_name);
        }

        console.log("Database seeding completed");

    } catch (err) {
        console.error("❌ Error seeding database:", err);
    } finally {
        await client.close();
    }
}

seedDatabase();