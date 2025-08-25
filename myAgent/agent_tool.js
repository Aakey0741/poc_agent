const callAiAgent = async (client, query, threadId) => {
    const dbName = "hr_demo";
    const db = client.db(dbName);
    const collection = db.collection("employees");
}
export { callAiAgent }