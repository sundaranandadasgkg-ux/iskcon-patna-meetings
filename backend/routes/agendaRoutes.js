const express = require('express');
const router = express.Router();
const Agenda = require('../models/Agenda');

const { auth, checkRole } = require('../middleware/auth');

// 1. Submit a New Agenda (By Member)
router.post('/submit', auth, async (req, res) => {
    try {
        const { title, description, priority, panel, } = req.body;

        const newAgenda = new Agenda({
            title,
            description,
            priority,
            panel,
            submittedBy: req.user.id,
            status: 'pending' // Hamesha pending se shuru hoga
        });

        const savedAgenda = await newAgenda.save();
        res.status(201).json({ message: "Agenda submitted for approval!", data: savedAgenda });
    } catch (err) {
        
        res.status(500).json({ error: err.message });
    }
});

// 2. Get All Agendas for History (Sorted by Date)
router.get('/history', auth, async (req, res) => {
    try {
        const agendas = await Agenda.find()
            .populate('submittedBy', 'name role') // Member ka naam aur role bhi dikhayega
            .sort({ createdAt: -1 }); // Naya sabse upar
        res.status(200).json(agendas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Admin: Get all Pending Agendas
router.get('/admin/pending', auth, checkRole(['admin']), async (req, res) => {
    
    try {
        const pendingAgendas = await Agenda.find({ status: 'pending' })
            .populate('submittedBy', 'name role')
            .sort({ createdAt: -1 });
        res.status(200).json(pendingAgendas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Admin: Approve or Reject an Agenda
router.patch('/admin/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body; // Status 'approved' ya 'rejected' bhejna hai
        
        const updatedAgenda = await Agenda.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        res.status(200).json({ message: `Agenda marked as ${status}`, data: updatedAgenda });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. // GET /api/agendas/on-floor (Sirf Approved Agendas)
router.get('/on-floor', auth, async (req, res) => {
    try {
        const approvedAgendas = await Agenda.find({ status: 'approved' })
            .populate('submittedBy', 'name')
            .sort({ priority: -1, date: 1 }); // Urgent pehle, aur purane pehle (FIFO)
        res.json(approvedAgendas);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 6. PUT: Update Agenda during/after Meeting
router.put('/meeting/update/:id', auth, checkRole(['admin', 'tmc']), async (req, res) => {
    try {

        
        const { meetingNotes, responsiblePerson, department, dueDate } = req.body;

        const updatedAgenda = await Agenda.findByIdAndUpdate(
            req.params.id,
            {
                meetingNotes,
                responsiblePerson,
                department,
                dueDate,
                status: 'discussed' // Discussion khatam hote hi status badal jayega
            },
            { new: true }
        );

        res.status(200).json({ 
            message: "Agenda updated and moved to Dashboard!", 
            data: updatedAgenda 
        });
    } catch (err) {
        
        res.status(500).json({ error: err.message });
    }
});

// 7. Meeting Tab: Get only Approved Agendas for discussion
router.get('/approved-for-meeting', auth, async (req, res) => {
    try {
        const approvedAgendas = await Agenda.find({ status: 'approved' })
            .populate('submittedBy', 'name role');
        res.status(200).json(approvedAgendas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Meeting Tab: Update agenda with Discussion Notes (TMC/Admin only)
// Route: /update-meeting-details/:id
router.patch('/update-meeting-details/:id', auth, async (req, res) => {
    try {
        const { meetingNotes, responsiblePerson, dueDate } = req.body;
        
        const updatedAgenda = await Agenda.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    meetingNotes: meetingNotes,
                    responsiblePerson: responsiblePerson,
                    dueDate: dueDate
                } 
            },
            { new: true } // Taaki update hone ke baad naya data return kare
        );

        if (!updatedAgenda) return res.status(404).json({ msg: "Agenda not found" });
        
        res.status(200).json(updatedAgenda);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Sirf discussed agendas (Completed Tasks) ke liye
router.get('/final-history', auth, async (req, res) => {
    try {
        const history = await Agenda.find({ status: 'discussed' })
            .populate('submittedBy', 'name')
            .sort({ updatedAt: -1 }); // Sabse naya discussion upar
        res.json(history);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Apne agendaRoutes.js mein ye add karein
router.get('/me', auth, async (req, res) => {
    try {
        const myAgendas = await Agenda.find({ submittedBy: req.user.id })
            .sort({ createdAt: -1 });
        res.json(myAgendas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Naya progress update add karne ke liye
router.patch('/update-progress/:id', auth, async (req, res) => {
    try {
        const { updateText } = req.body;
        const updatedAgenda = await Agenda.findByIdAndUpdate(
            req.params.id,
            { 
                $push: { 
                    progressUpdates: { 
                        text: updateText, 
                        updatedAt: new Date() 
                    } 
                } 
            },
            { new: true }
        );
        res.json(updatedAgenda);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// Backend: routes/agendas.js
router.patch('/complete-task/:id', auth, async (req, res) => {
    try {
        const updated = await Agenda.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' }, // Status change to completed
            { returnDocument: 'after' }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Not authorized" });
    await Agenda.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
});

// Jab agenda discussion se dashboard par move hota hai
// Route: /move-to-dashboard/:id
router.patch('/move-to-dashboard/:id', auth, async (req, res) => {
    try {
        const { meetingNotes, responsiblePerson, dueDate } = req.body;

        const updatedAgenda = await Agenda.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    status: 'discussed', // Status yahan badal raha hai
                    meetingNotes: meetingNotes,
                    responsiblePerson: responsiblePerson,
                    dueDate: dueDate
                } 
            },
            { new: true }
        );

        if (!updatedAgenda) return res.status(404).json({ msg: "Agenda not found" });

        res.status(200).json({ message: "Moved to Dashboard", data: updatedAgenda });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;