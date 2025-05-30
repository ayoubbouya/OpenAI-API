require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '25mb' }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
};

app.get('/', (req, res) => {
    res.send('Welcome to the OpenAI API Interface!');
});

app.post('/api/message', async (req, res) => {
    const { messages, model, max_tokens } = req.body;

    try {
        const response = await axios.post(OPENAI_API_URL, {
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
        const response = await axios.post(OPENAI_API_URL, payload, { headers });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Image Analysis Error:", error.response?.data || error.message);
        res.status(500).json({
            error: 'OpenAI Vision API request failed.',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`AI Calorie Tracker API running on port ${PORT}`);
});