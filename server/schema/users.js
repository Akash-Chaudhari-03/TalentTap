//USER SCHEMA
//imports
const mongoose = require('mongoose');

//schema
const personalDetail = new mongoose.Schema({
    email : String,
    password : String,
    username : String,
    firstName : String,
    lastName : String,
    location : String,
    bio : String,
    contact : String
})

const collegeDetail = new mongoose.Schema({
    collegeName : String,
    collegeLocation : String,
    branch : String,
    year : String,
    stream : String
})

const certificationDetail = new mongoose.Schema({
    certificateName : String,
    organization : String,
    issueDate : Date,
    expiryDate : Date,
    credentialLink : String
})

const projectDetail = new mongoose.Schema({
    projectName : String,
    description : String,
    projectLink : String
})

const skillDetail = new mongoose.Schema({
    skill : String,
    experience : Number
})

const userSchema = new mongoose.Schema({
    personalDetail : personalDetail,
    collegeDetail : collegeDetail,
    certificationDetail : [certificationDetail],
    projectDetail : [projectDetail],
    skillDetail : [skillDetail],
    rating : Number,
    isAvailable : Boolean
}, { minimize: false })

//creating model
const model = mongoose.model('usersList', userSchema);

//exporting
module.exports = model; 