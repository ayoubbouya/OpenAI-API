require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(cors());

const PORT = process.env.PORT || 3000;

// URLs
const CHAT_API_URL = "https://api.openai.com/v1/chat/completions";
const IMAGE_GEN_API_URL = "https://api.openai.com/v1/responses";

const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
};

// Root
app.get('/', (req, res) => {
    res.send('Welcome to the AI API Interface (Chat, Vision, Image Generation)');
});

// Chat endpoint
app.post('/api/message', async (req, res) => {
    const { messages, model, max_tokens } = req.body;

    try {
        const response = await axios.post(CHAT_API_URL, {
            model,
            messages,
            max_tokens
        }, { headers });

        res.json(response.data);
    } catch (error) {
        console.error('Message API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
});

// Vision endpoint
app.post('/api/analyze-image', async (req, res) => {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
        return res.status(400).json({ error: 'Missing image or prompt.' });
    }

    const payload = {
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${image}`
                        }
                    }
                ]
            }
        ],
        max_tokens: 500
    };

    try {
        const response = await axios.post(CHAT_API_URL, payload, { headers });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Image Analysis Error:", error.response?.data || error.message);
        res.status(500).json({
            error: 'OpenAI Vision API request failed.',
            details: error.response?.data || error.message
        });
    }
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Invalid or missing prompt.' });
    }

    const payload = {
        model: 'gpt-4.1-mini',
        input: prompt,
        tools: [{ type: 'image_generation' }]
    };

    try {
        const response = await axios.post(IMAGE_GEN_API_URL, payload, { headers });
        const outputs = response.data.output || [];

        const imageData = outputs.find(item => item.type === 'image_generation_call')?.result;

        if (!imageData) {
            return res.status(500).json({ error: 'No image data found in response.' });
        }

        res.json({
            message: 'Image generated successfully.',
            imageBase64: imageData
        });

    } catch (error) {
        console.error('Image Generation Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate image.',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Unified AI API running on port ${PORT}`);
});