import mongoose from 'mongoose';

const transaction_batch = new mongoose.Schema({
    "ID": {
        type: String,
        required: false
    },
    "data_type": {
        type: String,
        required: false
    },
    "productCode": {
        type: String,
        required: false
    },
    "fund": {
        type: String,
        required: false
    },
    "folioNumber": {
        type: String,
        required: false
    },
    "schemeCode": {
        type: String,
        required: false
    },
    "dividend": {
        type: String,
        required: false
    },
    "fundDesc": {
        type: String,
        required: false
    },
    "tranHead": {
        type: String,
        required: false
    },
    "tranNumber": {
        type: String,
        required: false
    },
    "switchNumber": {
        type: String,
        required: false
    },
    "instrumenNumber": {
        type: String,
        required: false
    },
    "joint1": {
        type: String,
        required: false
    },
    "joint2": {
        type: String,
        required: false
    },
    "taxStatus": {
        type: String,
        required: false
    },
    "occCode": {
        type: String,
        required: false
    },
    "transMode": {
        type: String,
        required: false
    },
    "TtransMode": {
        type: String,
        required: false
    },
    "transStatus": {
        type: String,
        required: false
    },
    "branchName": {
        type: String,
        required: false
    },
    "branchTransNumber": {
        type: String,
        required: false
    },
    "transDate": {
        type: String,
        required: false
    },
    "processDt": {
        type: String,
        required: false
    },
    "price": {
        type: Number,
        required: false
    },
    "loadPercentage": {
        type: String,
        required: false
    },
    "unit": {
        type: Number,
        required: false
    },
    "amt": {
        type: Number,
        required: false
    },
    "loadAmt": {
        type: String,
        required: false
    },
    "agentCode": {
        type: String,
        required: false
    },
    "subbrokerCode": {
        type: String,
        required: false
    },
    "brokerPercentage": {
        type: String,
        required: false
    },
    "commision": {
        type: String,
        required: false
    },
    "investorId": {
        type: String,
        required: false
    },
    "reportDt": {
        type: String,
        required: false
    },
    "reportTime": {
        type: String,
        required: false
    },
    "transSub": {
        type: String,
        required: false
    },
    "appNumber": {
        type: String,
        required: false
    },
    "transactionID": {
        type: String,
        required: false
    },
    "appTransDesc": {
        type: String,
        required: false
    },
    "appTransType": {
        type: String,
        required: false
    },
    "orgPurchaseDt": {
        type: String,
        required: false
    },
    "orgPurchaseAmt": {
        type: String,
        required: false
    },
    "orgPurchaseUnit": {
        type: String,
        required: false
    },
    "trType": {
        type: String,
        required: false
    },
    "switchDt": {
        type: String,
        required: false
    },
    "sInstrumentDt": {
        type: String,
        required: false
    },
    "sInstrumentBank": {
        type: String,
        required: false
    },
    "remark": {
        type: String,
        required: false
    },
    "scheme": {
        type: String,
        required: false
    },
    "plan": {
        type: String,
        required: false
    },
    "nav": {
        type: String,
        required: false
    },
    "annulizedPercentage": {
        type: String,
        required: false
    },
    "annulizedCommision": {
        type: String,
        required: false
    },
    "orgPurchaseTrxn": {
        type: String,
        required: false
    },
    "orgPurchaseBranch": {
        type: String,
        required: false
    },
    "oldAccNo": {
        type: String,
        required: false
    },
    "IHNO": {
        type: String,
        required: false
    },
    "source_code": {
        type: String,
        required: false
    },
    "basic_TDS": {
        type: String,
        required: false
    },
    "total_TDS": {
        type: String,
        required: false
    },
    "form_15H": {
        type: String,
        required: false
    },
    "swflag": {
        type: String,
        required: false
    },
    "sequence_number": {
        type: String,
        required: false
    },
    "reinvest_flag": {
        type: String,
        required: false
    },
    "multi_brokers": {
        type: String,
        required: false
    },
    "STT": {
        type: String,
        required: false
    },
    "scheme_type": {
        type: String,
        required: false
    },
    "entry_load": {
        type: String,
        required: false
    },
    "scan_ref_no": {
        type: String,
        required: false
    },
    "MIN": {
        type: String,
        required: false
    },
    "target_src_scheme": {
        type: String,
        required: false
    },
    "trans_type_flag": {
        type: String,
        required: false
    },
    "arn_id": {
        type: Number,
        required: false
    },
    "file_id": {
        type: String,
        required: false
    },
    "tID": {
        type: String,
        required: false
    },
    "trxn_suffix": {
        type: String,
        required: false
    },
    "Ticob_Trty": {
        type: String,
        required: false
    },
    "usrtrxno": {
        type: String,
        required: false
    },
    "micr_no": {
        type: String,
        required: false
    },
    "ticob_trno": {
        type: String,
        required: false
    },
    "ticob_post": {
        type: String,
        required: false
    },
    "db_id": {
        type: String,
        required: false
    },
    "trxn_charges": {
        type: String,
        required: false
    },
    "eligib_amt": {
        type: String,
        required: false
    },
    "inward_no": {
        type: String,
        required: false
    },
    "ISIN": {
        type: String,
        required: false
    },
    "conclusion": {
        type: String,
        required: false
    },
    "conclusion_desc": {
        type: String,
        required: false
    },
    "status": {
        type: String,
        required: false
    },
    "agentCode2": {
        type: String,
        required: false
    },
    "consider": {
        type: String,
        required: false
    },
    "conclusion2": {
        type: String,
        required: false
    },
    "conclusion_desc2": {
        type: String,
        required: false
    },
    "consider2": {
        type: Number,
        required: false
    },
    "pan1": {
        type: String,
        required: false
    },
    "nctChangeDt": {
        type: String,
        required: false
    },
    "rejTrnoOrgNo": {
        type: String,
        required: false
    },
    "clientID": {
        type: String,
        required: false
    },
    "dpID": {
        type: String,
        required: false
    },
    "toProductCode": {
        type: String,
        required: false
    },
    "navDt": {
        type: String,
        required: false
    },
    "portDt": {
        type: String,
        required: false
    },
    "assetType": {
        type: String,
        required: false
    },
    "subTransType": {
        type: String,
        required: false
    },
    "cityCategory": {
        type: String,
        required: false
    },
    "euin": {
        type: String,
        required: false
    },
    "subBrokARNno": {
        type: String,
        required: false
    },
    "pan2": {
        type: String,
        required: false
    },
    "pan3": {
        type: String,
        required: false
    },
    "td_trxnMode": {
        type: String,
        required: false
    },
    "ATMCardStatus": {
        type: String,
        required: false
    },
    "ATMCardRemark": {
        type: String,
        required: false
    },
    "newUnqNo": {
        type: String,
        required: false
    },
    "euinValidIndi": {
        type: String,
        required: false
    },
    "EuinDeclareIndi": {
        type: String,
        required: false
    },
    "sipRegnDt": {
        type: String,
        required: false
    },
    "insert_time": {
        type: String,
        required: false
    }
}, {
    versionKey: false
});

const transactionBatch = mongoose.model('transaction_batch', transaction_batch);

export default transactionBatch;