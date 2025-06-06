require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(cors());

const PORT = process.env.PORT || 3000;

// OpenAI API Endpoints
const CHAT_API_URL = "https://api.openai.com/v1/chat/completions";
const IMAGE_GEN_API_URL = "https://api.openai.com/v1/responses";

const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
};

// Health check
app.get('/', (req, res) => {
    res.send('Welcome to the Unified AI API (Chat, Vision, Image Generation)');
});

// Chat & Image endpoint (smart handling)
app.post('/api/message', async (req, res) => {
    const { messages, model, max_tokens } = req.body;

    // Validate required fields
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid messages array.' });
    }

    if (typeof model !== 'string' || !model.trim()) {
        return res.status(400).json({ error: 'Missing or invalid model.' });
    }

    if (typeof max_tokens !== 'number' || max_tokens <= 0) {
        return res.status(400).json({ error: 'Missing or invalid max_tokens.' });
    }

    // Analyze last message for intent
    const lastMessage = messages[messages.length - 1];
    const lastText = lastMessage?.content?.find(c => c.type === "text")?.text?.toLowerCase() || "";

    try {
        const shouldGenerateImage =
            lastText.includes("generate") &&
            lastText.includes("image");

        if (shouldGenerateImage) {
            // Image generation branch
            const payload = {
                model: "gpt-4.1-mini",
                input: lastText,
                tools: [{ type: "image_generation" }]
            };

            const response = await axios.post(IMAGE_GEN_API_URL, payload, { headers });
            const outputs = response.data.output || [];
            const imageData = outputs.find(item => item.type === 'image_generation_call')?.result;

            if (!imageData) {
                return res.status(500).json({ error: "No image data returned from OpenAI." });
            }

            return res.json({
                type: "image",
                imageBase64: imageData
            });
        }

        // Chat completion branch
        const response = await axios.post(CHAT_API_URL, {
            model,
            messages,
            max_tokens
        }, { headers });

        return res.json({
            type: "chat",
            ...response.data
        });

    } catch (error) {
        console.error("Unified AI API Error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Unified AI API request failed.",
            details: error.response?.data || error.message
        });
    }
});

// Vision endpoint
app.post('/api/analyze-image', async (req, res) => {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
        return res.status(400).json({ error: "Missing image or prompt." });
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
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Vision API Error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Vision API request failed.",
            details: error.response?.data || error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Unified AI API running on port ${PORT}`);
});