const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
// const { AIMessage, HumanMessage } = require("@langchain/core/messages");
// const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
// const { StateGraph, Annotation } = require("@langchain/langgraph");
// const { tool } = require("@langchain/core/tools");
// const { ToolNode } = require("@langchain/langgraph/prebuilt");
// const { MongoDBSaver } = require("@langchain/langgraph-checkpoint-mongodb");
// const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
// const { z } = require("zod");
require("dotenv").config();
const { find_all } = require("./crud")

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callAiAgent(client, query, thread_id) {
    // let aumWords = []
    // let clientInfoWords = ["info", "detail", "details", "information"];
    // let transactionWords = []
    const clientMatch = query.match(/client\s*id\s*(\d+)/i);
    const arnMatch = query.match(/arn\s*id\s*(\d+)/i);
    const clientId = clientMatch ? clientMatch[1] : null;
    const arnId = arnMatch ? arnMatch[1] : null;

    console.log({ query })

    let modelName = '';
    let limit = '';
    let select = {
        _id: 0
    };
    let condition = {}
    condition.arn_id = parseInt(arnId);

    if ((/aum/i.test(query) && arnId) || (/(current valuation|valuation)/i.test(query) && arnId && clientId)) {
        modelName = 'present_day_summary'
        if (clientId) {
            condition.ID = clientId;
        }
        select.ID = 1
        select.folio = 1
        select.units = 1
        select.amt_inv = 1
        select.cur_val = 1
        select.pur_amt = 1
        select.pur_unit = 1
        select.final_cagr = 1
    }
    if ((/(transaction|transactions|transactions detail|transactions details)/i.test(query) && arnId && clientId)) {
        modelName = 'transaction_batch'
        if (clientId) {
            condition.ID = clientId;
            select.ID = 1
            select.data_type = 1
            select.productCode = 1
            select.folioNumber = 1
            select.schemeCode = 1
            select.price = 1
            select.unit = 1
            select.amt = 1
            select.appTransDesc = 1
            select.nav = 1
            limit = 5;
        }
    }
    if ((/(info|detail|details|information|informations)/i.test(query) && arnId && clientId)) {
        modelName = 'client_batch'
        if (clientId) {
            condition.ID = clientId;
            select.ID = 1
            select.name = 1
            select.pan = 1
            select.DOB = 1
            select.mobile = 1
            select.email = 1
            select.address = 1
            select.pincode = 1
        }
    }

    let value = 0;
    let outputLimit = 800;

    if (modelName) {
        let final_params = {
            client,
            modelName,
            where: condition,
            select
        }
        if (limit) {
            final_params.limit = limit;
        }
        const dbData = await find_all(final_params);

        let clientDetails = '';
        if (arnId && clientId) {
            clientDetails = await find_all({
                client,
                modelName: 'client_batch',
                where: { arn_id: parseInt(arnId), ID: clientId },
                select: {
                    _id: 0,
                    name: 1
                }
            });
        }

        if (dbData.length > 0) {
            if (modelName === "present_day_summary") {
                let calculated_aum = 0;
                for (let single of dbData) {
                    calculated_aum = parseFloat(calculated_aum) + parseFloat(single.cur_val ? single?.cur_val : 0);
                }
                value = `${clientId ? `Hi ${clientDetails[0].name}, ` : ''} This your current date ${clientId ? 'valuation' : 'aum'} = ${calculated_aum}`;
            }
            if (modelName === "transaction_batch") {
                value = `${clientId ? `Hi ${clientDetails[0].name}, ` : ''} Your transactions are = ${JSON.stringify(dbData)}, Please make this json stringify data in html tabler view. And Price, Units and Amount column should come after all columns in table with right align text formatting and also add table footer with 'Total' label and in the footer show addition of Price, Units, Amount column with right align text formatting`;
            }
            if (modelName === "client_batch") {
                value = `${clientId ? `Hi ${clientDetails[0].name}, ` : ''} Profile Details are = ${JSON.stringify(dbData)}, Please make this json stringify data in html tabler view left column label and right column value with right text align.`;
            }
        }
        outputLimit = 1200;
    } else {
        value = query;
    }

    // console.log({ value });

    const model = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",//"gemini-1.5-pro", // you can also try gemini-1.5-flash (faster & cheaper)
        apiKey: GEMINI_API_KEY,
        temperature: 0.7,
        maxOutputTokens: outputLimit,
    });

    const prompt = `You are a helpful assistant that generates in professional content from given prompt, So can you do this for me in well formated. ${value}`;

    // console.log({ prompt });

    const response = await model.invoke(prompt);
    const rawText = response.content;

    // let cleaned = rawText.replace(/```html|```/g, "").trim();
    let cleanedStr = rawText
        .replace(/```html\n?/g, "")  // remove ```html (with possible newline after)
        .replace(/```/g, "");        // remove closing ```


    return cleanedStr;
}

module.exports = { callAiAgent };
