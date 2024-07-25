const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for comments on posts
const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    date: { type: Date, default: Date.now }
});

// Define schema for community posts
const postDetailSchema = new Schema({
    postTitle: { type: String, required: true },
    opID: { type: String, required: true }, // Custom userID from personalDetail
    opName: { type: String, required: true }, // Username
    postDescription: { type: String, required: true },
    tags: [String],
    projectLink: String,
    fileAttachments: [{ // Array of file attachments
        filename: { type: String, required: true },
        url: { type: String, required: true }
    }],
    creationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    isClosed: { type: Boolean, default: false },
    visibility: { type: String, enum: ['Public', 'Private', 'Restricted'], default: 'Public' },
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' }
});

// Export the model
module.exports = mongoose.model('PostDetail', postDetailSchema);
