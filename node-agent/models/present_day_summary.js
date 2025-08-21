import mongoose from 'mongoose';

const present_day_summary = new mongoose.Schema({
    arn_id: {
        type: Number,
        required: false
    },
    data_type: {
        type: String,
        required: false
    },
    ID: {
        type: String,
        required: false
    },
    folio: {
        type: String,
        required: false
    },
    sCode: {
        type: String,
        required: false
    },
    pur_nav: {
        type: String,
        required: false
    },
    divPaid: {
        type: String,
        required: false
    },
    divReInv: {
        type: String,
        required: false
    },
    units: {
        type: String,
        required: false
    },
    amt_inv: {
        type: String,
        required: false
    },
    fund: {
        type: String,
        required: false
    },
    fundDesc: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    cur_val: {
        type: String,
        required: false
    },
    rID: {
        type: String,
        required: false
    },
    code: {
        type: String,
        required: false
    },
    tID: {
        type: String,
        required: false
    },
    pur_amt: {
        type: String,
        required: false
    },
    pur_unit: {
        type: String,
        required: false
    },
    agentCode: {
        type: String,
        required: false
    },
    IHNO: {
        type: String,
        required: false
    },
    final_cagr: {
        type: String,
        required: false
    },
    cagr_values: {
        type: String,
        required: false
    },
    cagr_dates: {
        type: String,
        required: false
    },
    insert_time: {
        type: String,
        required: false
    }
}, {
    versionKey: false
});

const presentDaySummary = mongoose.model('present_day_summary', present_day_summary);

export default presentDaySummary;