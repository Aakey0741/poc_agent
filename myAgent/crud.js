// const mongoose = require('mongoose');
// require('./schema_register');

const find_all = async (query_params) => {
    const { client, modelName, where = {}, select = {}, sort = {}, limit = 0, skip = 0 } = query_params;
    const dbName = "elite_db";
    const db = client.db(dbName);
    const collection = db.collection(modelName);
    const data = await collection.find(
        where,
        { projection: select }
    )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

    // const data = await groupModel.find(where, select).sort(sort).limit(limit).skip(skip).lean();
    return data
};

const find_one = async (query_params) => {
    const { modelName, where = {}, select = {}, sort = {}, limit = 0, skip = 0 } = query_params;

    const groupModel = mongoose.model(modelName);
    return await groupModel.findOne(where, select).sort(sort).limit(limit).skip(skip).lean();
};

module.exports = { find_all, find_one }