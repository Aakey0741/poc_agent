const mongoose = require('mongoose');

const client_schema = new mongoose.Schema({
    emp_id: {
        type: Array,
        required: false
    },
    mapped_emp: {  //false : not mapped, true : mapped
        type: Boolean,
        default: false
    },
    ID: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    add1: {
        type: String,
        required: false
    },
    add2: {
        type: String,
        required: false
    },
    add3: {
        type: String,
        required: false
    },
    city_id: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    pincode: {
        type: Number,
        required: false
    },
    aadhar: {
        type: String,
        required: false
    },
    equity_ucc: {
        type: String,
        required: false
    },
    cadd1: {
        type: String,
        required: false
    },
    cadd2: {
        type: String,
        required: false
    },
    cadd3: {
        type: String,
        required: false
    },
    ccity: {
        type: String,
        required: false
    },
    cpincode: {
        type: String,
        required: false
    },
    city_area_id: {
        type: String,
        required: false
    },
    risk_profile_id: {
        type: String,
        required: false
    },
    client_segment_id: {
        type: String,
        required: false
    },
    company_id: {
        type: String,
        required: false
    },
    occupation_id: {
        type: String,
        required: false
    },
    profession_id: {
        type: String,
        required: false
    },
    designation_id: {
        type: String,
        required: false
    },
    designation: {
        type: String,
        required: false
    },
    salutation: {
        type: String,
        required: false
    },
    pan: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    DOB: {
        type: String,
        required: false
    },
    dob_item_id: {
        type: String,
        required: false
    },
    anniv_item_id: {
        type: String,
        required: false
    },
    crm_dd: {
        type: String,
        required: false
    },
    anniversary: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    mobile: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    bd_grp: {
        type: String,
        required: false
    },
    bank: {
        type: String,
        required: false
    },
    familyID: {
        type: String,
        required: false
    },
    bankAccount: {
        type: String,
        required: false
    },
    bankAddress: {
        type: String,
        required: false
    },
    timeStamp: {
        type: Number,
        required: false
    },
    officePhone: {
        type: String,
        required: false
    },
    faxOffice: {
        type: String,
        required: false
    },
    faxRes: {
        type: String,
        required: false
    },
    bankBranch: {
        type: String,
        required: false
    },
    accountType: {
        type: String,
        required: false
    },
    bankPhone: {
        type: String,
        required: false
    },
    availLogin: {
        type: String,
        required: false
    },
    arn_id: {
        type: Number,
        required: false
    },
    lock_profile: {
        type: String,
        required: false
    },
    dID: {
        type: String,
        required: false
    },
    CM: {
        type: String,
        required: false
    },
    FH: {
        type: String,
        required: false
    },
    fpa: {
        type: String,
        required: false
    },
    fpl: {
        type: String,
        required: false
    },
    add_type: {
        type: String,
        required: false
    },
    client_date: {
        type: String,
        required: false
    },
    create_date: {
        type: String,
        required: false
    },
    code: {
        type: Array,
        required: false
    },
    mapped_clients: {
        type: Array,
        required: false
    },
    homeAddress: {
        homeAddress: String,
        homeState: String,
        homeCity: String,
        homePin: String,
        homePhone: String,
        homeMobile: String,
    },
    dematAccount: {
        dp: String,
        dpName: String,
        dpId: String,
        dpAc: String
    },
    officeAddress: {
        officeAddress: String,
        officeState: String,
        officeCity: String,
        officePin: String,
        officePhone: String,
        officeMobile: String
    },
    overseasAddress: {
        officeAddress: String,
        officeState: String,
        officeCity: String,
        officePin: String,
        officePhone: String,
        officeMobile: String
    },
    bankDetailArray: [
        {
            bankName: String,
            bankBranch: String,
            bankAddress: String,
            bankAccount: String,
            accountType: String,
            bankCity: String,
            bankPin: String,
            bankMicr: String,
            bankIfsc: String,
            bankMain: String
        }
    ],
    familyLabel: {
        type: String,
        required: false
    },
    clientLabel: {
        type: String,
        required: false
    },
    dollarBullOptInStatus: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('client_batch', client_schema);