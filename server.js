require('dotenv').config();
const express = require('express');
const cors = require('cors');

const {
    handleChatMessage,
    handleImageAnalysis,
    handleImageGeneration
} = require('./controllers/openaiController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Health Check
app.get('/', (_, res) => {
    res.send('✅ AI API Interface is running (Chat, Vision, Image Generation)');
});

// Routes
app.post('/api/message', handleChatMessage);
app.post('/api/analyze-image', handleImageAnalysis);
app.post('/api/generate-image', handleImageGeneration);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Unified AI API is running on port ${PORT}`);
});