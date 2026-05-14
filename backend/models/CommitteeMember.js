const mongoose = require('mongoose');

const CommitteeMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['member', 'admin', 'tmc', 'zmt'], // Charo categories yahan hain
        default: 'member' 
    },
    department: {
        type: String,
        default: 'General'
    }
}, { timestamps: true });

module.exports = mongoose.model('CommitteeMember', CommitteeMemberSchema);