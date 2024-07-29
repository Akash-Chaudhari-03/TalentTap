const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscribedUsers = new Schema({
    userId: String,     // UserID from the users collection
    subscriptionDate: { type: Date, default: Date.now }, // Timestamp when the user subscribed
    isSubscribed : { type: Boolean, default: true }
})

const tagSchema = new mongoose.Schema({
    tagName : String,
    tagID : String, 
    createdAt : { type: Date, default: Date.now }, 
    updatedAt : { type: Date, default: Date.now },  
    category : String,   
    isActive : Boolean,
    usersSubscribed : [subscribedUsers]
})

//export model
module.exports = mongoose.model('TagsDetail', tagSchema);