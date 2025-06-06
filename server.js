require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;

const { handleChatMessage, handleImageAnalysis, handleImageGeneration } = require('./src/controllers/openaiController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser({ limit: '25mb' }));

// Health check
app.get('/', (_, res) => {
    res.send('✅ AI API Interface is running (Chat, Vision, Image Generation)');
});

// Routes
app.post('/api/message', handleChatMessage);
app.post('/api/analyze-image', handleImageAnalysis);
app.post('/api/generate-image', handleImageGeneration);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Unified AI API is running on port ${PORT}`);
});