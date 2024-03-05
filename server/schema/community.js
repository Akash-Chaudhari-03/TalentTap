//COMMUNITY FORUM POSTS SCHEMA

//imports
const mongoose = require('mongoose');

//schema
const projectDetail = new mongoose.Schema({
    postTitle : String,
    opName : String,
    postDecription : String,
    tags : [String],
    Projectlink : String
})

const postDetail = new mongoose.Schema({
    projectDetail : projectDetail,
    datePosted : Date,
    isClosed : Boolean
})

//creating model
const model = mongoose.model('communityPostList', postDetail);

//exporting
module.exports = model; 