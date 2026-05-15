const mongoose = require('mongoose');

const AgendaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommitteeMember', // User model se connect rahega
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'discussed', 'rejected', 'completed'],
        default: 'pending'
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Urgent'], 
        default: 'Medium' 
    },
    panel: { 
        type: String, 
        enum: ['ZMT', 'TMC'], 
        required: true 
    },
    // Ye niche waale fields 'Meeting Tab' mein bhare jayenge
    meetingNotes: {
        type: String,
        default: ''
    },
    responsiblePerson: {
        type: String,
        default: 'Not Assigned'
    },
    department: {
        type: String,
        default: 'General'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    progressUpdates: [
    {
        text: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: String // Agar aap user ka naam track karna chahte hain
    }
    ],

    dueDate: { type: Date },
});

module.exports = mongoose.model('Agenda', AgendaSchema);