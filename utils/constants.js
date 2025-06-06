module.exports = {
    CHAT_API_URL: 'https://api.openai.com/v1/chat/completions',
    IMAGE_GEN_API_URL: 'https://api.openai.com/v1/responses',
    headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    }
};