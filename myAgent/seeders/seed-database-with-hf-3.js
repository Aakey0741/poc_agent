import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { HuggingFaceInference } from "@langchain/community/llms/hf";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_ATLAS_URI;
const HF_API_KEY = process.env.HF_API_KEY;
console.log(MONGODB_URI)
const client = new MongoClient(MONGODB_URI);

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

const parser = StructuredOutputParser.fromZodSchema(employeeSchema);

async function generateSyntheticData() {
    const model = new HuggingFaceInference({
        model: "gpt2", // koi bhi text-gen HF model
        apiKey: HF_API_KEY,
        provider: "hf-inference",
        temperature: 0.7,
        maxTokens: 512,
    });

    const prompt = `
  Generate a fake employee record strictly in JSON.
  Schema: ${parser.getFormatInstructions()}
  `;

    const response = await model.invoke(prompt);
    const parsed = await parser.parse(response);
    return parsed;
}

async function seedDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");
        const db = client.db("hr_demo");
        const employees = db.collection("employees");

        console.log("⚡ Generating synthetic data from Hugging Face...");
        const record = await generateSyntheticData();

        await employees.insertOne(record);
        console.log("✅ Inserted employee:", record.first_name, record.last_name);
    } catch (err) {
        console.error("❌ Error seeding database:", err);
    } finally {
        await client.close();
    }
}

seedDatabase();
