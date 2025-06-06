const axios = require('axios');
const { CHAT_API_URL, IMAGE_GEN_API_URL, headers } = require('../utils/constants');

// Handle Chat Completions
exports.handleChatMessage = async (req, res) => {
    const { messages, model, max_tokens } = req.body;

    if (!Array.isArray(messages) || !model || typeof max_tokens !== 'number') {
        return res.status(400).json({ error: 'Invalid request: missing model, messages, or max_tokens.' });
    }

    try {
        const response = await axios.post(CHAT_API_URL, { model, messages, max_tokens }, { headers });
        res.json(response.data);
    } catch (error) {
        logAndRespond(res, 'Chat Completion Error', error);
    }
};

// Handle Vision + Image Analysis
exports.handleImageAnalysis = async (req, res) => {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
        return res.status(400).json({ error: 'Missing image or prompt.' });
    }

    const payload = {
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${image}` }
                    }
                ]
            }
        ],
        max_tokens: 500
    };

    try {
        const response = await axios.post(CHAT_API_URL, payload, { headers });
        res.json(response.data);
    } catch (error) {
        logAndRespond(res, 'Image Analysis Error', error);
    }
};

// Handle Image Generation
exports.handleImageGeneration = async (req, res) => {
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
        logAndRespond(res, 'Image Generation Error', error);
    }
};

// Utility: Log and send clean error
function logAndRespond(res, label, error) {
    console.error(`${label}:`, error.response?.data || error.message);
    res.status(500).json({
        error: `${label}.`,
        details: error.response?.data || error.message
    });
}