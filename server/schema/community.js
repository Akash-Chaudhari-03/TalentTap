const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for comments on posts
const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    date: { type: Date, default: Date.now }
});

// Define schema for community posts
const postDetailSchema = new mongoose.Schema({
    postTitle: { type: String, required: true },
    opID: { type: String, required: true }, // UserID from personalDetail
    opName: { type: String, required: true }, // Username from personalDetail
    postDescription: { type: String, required: true },
    tags: [{ type: String }], // Array of skill tags
    topics: [{ type: String }], // Array of topics
    projectLink: { type: String },
    experienceLevel: { type: String }, // New field: Experience level
    preferredRating: { type: Number }, // New field: Preferred rating
    location: { type: String }, // New field: Location
    fileAttachments: [
        {
            filename: { type: String },
            url: { type: String }
        }
    ],
    creationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    isClosed: { type: Boolean, default: false },
    visibility: { type: String, default: 'Public' },
    status: { type: String, default: 'Published' }
});

// Export the model
module.exports = mongoose.model('PostDetail', postDetailSchema);
