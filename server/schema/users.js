//USER SCHEMA
//imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//schema
const personalDetail = new mongoose.Schema({
    userID: { type: String, unique: true },
    email : String,
    password : String,
    role: { type: Schema.Types.ObjectId, ref: 'Role' }, // Reference to the role
    username : String,
    firstName : String,
    lastName : String,
    location : String,
    bio : String,
    contact : String
})

const collegeDetail = new mongoose.Schema({
    college_id : String,
    collegeName : String,
    collegeLocation : String,
    branch : String,
    year : String,
    stream : String,
    isValid : { type: Boolean, default: true }
})

const certificationDetail = new mongoose.Schema({
    certificate_id : String,
    certificateName : String,
    organization : String,
    issueDate : Date,
    expiryDate : Date,
    credentialLink : String,
    isValid : { type: Boolean, default: true }
})

const projectDetail = new mongoose.Schema({
    project_id : String,
    projectName : String,
    description : String,
    projectLink : String,
    isValid : { type: Boolean, default: true }
})

const skillDetail = new mongoose.Schema({
    skill_id : String,
    skill : String,
    experience : Number,
    isValid : { type: Boolean, default: true }
})

const userSchema = new mongoose.Schema({
    personalDetail : personalDetail,
    collegeDetail : [collegeDetail],
    certificationDetail : [certificationDetail],
    projectDetail : [projectDetail],
    skillDetail : [skillDetail],
    rating : Number,
    isAvailable : { type: Boolean, default: true }
}, { minimize: false })

//creating model
const model = mongoose.model('usersList', userSchema);

//exporting
module.exports = model; 