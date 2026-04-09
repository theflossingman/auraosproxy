const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Data storage (in production, use a proper database)
let auraData = {
    max: 0,
    gigi: 0,
    marco: 0,
    dezi: 0,
    sevi: 0
};

let dailyAuraData = {
    max: { 
        dezi: 0, 
        gigi: 0, 
        marco: 0, 
        sevi: 0, 
        date: new Date().toDateString() 
    },
    gigi: { 
        max: 0, 
        dezi: 0, 
        marco: 0, 
        sevi: 0, 
        date: new Date().toDateString() 
    },
    marco: { 
        max: 0, 
        gigi: 0, 
        dezi: 0, 
        sevi: 0, 
        date: new Date().toDateString() 
    },
    dezi: { 
        max: 0, 
        gigi: 0, 
        marco: 0, 
        sevi: 0, 
        date: new Date().toDateString() 
    },
    sevi: { 
        max: 0, 
        gigi: 0, 
        marco: 0, 
        dezi: 0, 
        date: new Date().toDateString() 
    }
};



// REST API endpoints
app.use(express.json());
app.use(express.static('.'));

// Get aura data
app.get('/api/aura', (req, res) => {
    res.json({ auraData, dailyAuraData });
});

// Update aura (fallback REST API)
app.post('/api/aura', (req, res) => {
    const { person, action, currentUser } = req.body;
    
    // Same validation logic as WebSocket
    if (!person || !action || !currentUser) {
        return res.status(400).json({ error: 'Invalid data' });
    }
    
    const today = new Date().toDateString();
    if (dailyAuraData[currentUser].date !== today) {
        Object.keys(dailyAuraData[currentUser]).forEach(key => {
            if (key !== 'date') {
                dailyAuraData[currentUser][key] = 0;
            }
        });
        dailyAuraData[currentUser].date = today;
    }
    
    const incrementAmount = 25;
    const currentGivenToPerson = dailyAuraData[currentUser][person] || 0;
    const DAILY_POSITIVE_LIMIT = 500;
    const DAILY_NEGATIVE_LIMIT = -500;
    
    if (action === 'increment') {
        if (currentGivenToPerson + incrementAmount > DAILY_POSITIVE_LIMIT) {
            return res.status(400).json({ 
                error: `You've reached your daily limit of ${DAILY_POSITIVE_LIMIT} aura for ${person.charAt(0).toUpperCase() + person.slice(1)}!` 
            });
        }
        auraData[person] += incrementAmount;
        dailyAuraData[currentUser][person] = currentGivenToPerson + incrementAmount;
    } else if (action === 'decrement') {
        if (currentGivenToPerson - incrementAmount < DAILY_NEGATIVE_LIMIT) {
            return res.status(400).json({ 
                error: `You've reached your daily negative limit of ${DAILY_NEGATIVE_LIMIT} aura for ${person.charAt(0).toUpperCase() + person.slice(1)}!` 
            });
        }
        auraData[person] -= incrementAmount;
        dailyAuraData[currentUser][person] = currentGivenToPerson - incrementAmount;
    }
    
    
    res.json({ success: true, auraData });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`Aura OS Backend Server running on http://${HOST}:${PORT}`);
    console.log(`Access from other devices on your network using your computer's IP address`);
});
