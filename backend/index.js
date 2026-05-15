const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const memberRoutes = require('./routes/memberRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
    origin: 'https://iskcon-patna-meetings-1.onrender.com' // Yahan apna live frontend URL dalein
}));

app.use('/api/agendas', agendaRoutes); // Sabhi agenda routes yahan se shuru honge
app.use('/api/members', memberRoutes);


// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/iskcon-meetings')
  .then(() => console.log("Radhe Radhe! MongoDB Connected"))
  .catch(err => console.log("Connection Error: ", err));

// Test Route
app.get('/', (req, res) => {
    res.send("TMC Meeting Server is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});
