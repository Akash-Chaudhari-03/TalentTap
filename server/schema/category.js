const mongoose = require('mongoose');

const subscribedUsers = new mongoose.Schema({
    userId: String,     // UserID from the users collection
    subscriptionDate: { type: Date, default: Date.now }, // Timestamp when the user subscribed
    isSubscribed: { type: Boolean, default: true }
});

const categorySchema = new mongoose.Schema({
    categoryName: String,
    categoryID: String, 
    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now },  
    isActive: Boolean,
    usersSubscribed: [subscribedUsers]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
