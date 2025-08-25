const { InferenceClient } = require("@huggingface/inference");
const { MongoClient } = require("mongodb");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/hf_transformers");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { z } = require("zod");
const dotenv = require("dotenv");

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const clientHF = new InferenceClient(HF_API_KEY);

const mongoClient = new MongoClient(process.env.MONGODB_ATLAS_URI);

// 📝 Schema definition
const EmployeeSchema = z.object({
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
        email: z.string().email(),
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
    work_location: z.object({
        nearest_office: z.string(),
        is_remote: z.boolean(),
    }),
    reporting_manager: z.string().nullable(),
    skills: z.array(z.string()),
    performance_reviews: z.array(
        z.object({
            review_date: z.string(),
            rating: z.number(),
            comments: z.string(),
        })
    ),
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

const parser = StructuredOutputParser.fromZodSchema(z.array(EmployeeSchema));

function cleanJsonResponse(text) {
    // Remove ```json or ``` wrappers
    let cleaned = text.replace(/```json|```/g, "").trim();

    // Optional: Ensure trailing commas are removed
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

    return cleaned;
}

async function generateSyntheticData() {
    const prompt = `Generate employee records following this JSON Schema.
        IMPORTANT:
        - Return ONLY valid JSON.
        - Do NOT include any explanations, notes, or text outside JSON.
        - The JSON must be an array.

        Schema: ${parser.getFormatInstructions()}`;

    console.log("Generating synthetic data from Hugging Face...");

    const response = await clientHF.chatCompletion({
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const cleanedOutput = cleanJsonResponse(content);
    const parsed = await parser.parse(cleanedOutput);
    return parsed;
}

async function createEmployeeSummary(employee) {
    const jobDetails = `${employee.job_details.job_title} in ${employee.job_details.department}`;
    const skills = employee.skills.join(", ");
    const performanceReviews = employee.performance_reviews
        .map(
            (review) =>
                `Rated ${review.rating} on ${review.review_date}: ${review.comments}`
        )
        .join(" ");
    const basicInfo = `${employee.first_name} ${employee.last_name}, born on ${employee.date_of_birth}`;
    const workLocation = `Works at ${employee.work_location.nearest_office}, Remote: ${employee.work_location.is_remote}`;
    const notes = employee.notes;

    return `${basicInfo}. Job: ${jobDetails}. Skills: ${skills}. Reviews: ${performanceReviews}. Location: ${workLocation}. Notes: ${notes}`;
}

async function seedDatabase() {
    try {
        await mongoClient.connect();
        await mongoClient.db("admin").command({ ping: 1 });
        console.log("✅ Connected to MongoDB!");

        const db = mongoClient.db("hr_database");
        const collection = db.collection("employees");

        await collection.deleteMany({});

        const syntheticData = await generateSyntheticData();

        const recordsWithSummaries = await Promise.all(
            syntheticData.map(async (record) => ({
                pageContent: await createEmployeeSummary(record),
                metadata: { ...record },
            }))
        );

        for (const record of recordsWithSummaries) {
            await MongoDBAtlasVectorSearch.fromDocuments(
                [record],
                new HuggingFaceTransformersEmbeddings({
                    modelName: "sentence-transformers/all-MiniLM-L6-v2",
                }),
                {
                    collection,
                    indexName: "vector_index",
                    textKey: "embedding_text",
                    embeddingKey: "embedding",
                }
            );

            console.log("✅ Saved record:", record.metadata.employee_id);
        }

        console.log("🎉 Database seeding completed");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await mongoClient.close();
    }
}

seedDatabase().catch(console.error);
