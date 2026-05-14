const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {auth} = require('../middleware/auth');
const CommitteeMember = require('../models/CommitteeMember');

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        
        // Check if user exists
        let user = await CommitteeMember.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        user = new CommitteeMember({ name, email, password, role, department });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();
        res.json({ msg: "Member registered successfully" });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await CommitteeMember.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).send("Server error");
    }
});


// GET: Sabhi users ki list nikalne ke liye (Sirf Admin dekh sake)
router.get('/all', auth, async (req, res) => {
    try {
        const users = await CommitteeMember.find().select('-password'); // Password nahi bhejna hai
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PUT: Kisi ka role badalne ke liye
router.put('/update-role/:id', auth, async (req, res) => {
    try {
        // Check karein ki request karne wala khud Admin hai ya nahi
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'admin') {
            return res.status(403).json({ msg: "Aapke paas permission nahi hai" });
        }

        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { role }, 
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Member delete karne ke liye
router.delete('/:id', async (req, res) => {
    try {
        await CommitteeMember.findByIdAndDelete(req.params.id);
        res.json({ msg: "Member deleted successfully" });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

module.exports = router;