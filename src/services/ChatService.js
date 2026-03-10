const API_KEY = 'YOUR_GEMINI_API_KEY'; // 🔑 TODO: Replace with your actual Gemini API Key

const SYSTEM_PROMPT = `
You are an expert Agronomist and Tea Plantation Manager for 'TeaVision'.
Your role is to assist tea estate owners and workers with:
1. Soil Health: interpreting NPK values, pH levels, and moisture.
2. Pest & Disease: identifying common tea pests (e.g., mites, caterpillars) and diseases (e.g., blister blight) and suggesting organic/chemical remedies.
3. Cultivation: pruning cycles, plucking standards, and shade management.
4. Weather: advice on farm activities based on weather conditions.

Keep your answers concise, practical, and encouraging.
If asked about topics unrelated to tea, agriculture, or soil, politely steer the conversation back to tea farming.
`;

export const sendMessageToGemini = async (userMessage) => {
    if (API_KEY === 'YOUR_GEMINI_API_KEY') {
        // Fallback if user hasn't set the key yet
        return "I'm ready to help! Please add your Google Gemini API Key in 'src/services/ChatService.js' to unlock my full potential.";
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: SYSTEM_PROMPT + "\nUser Query: " + userMessage }
                            ],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return "I'm having trouble accessing the tea knowledge base right now. Please check your API key.";
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "I didn't understand that. Could you rephrase related to tea cultivation?";
        }

    } catch (error) {
        console.error("Network Error:", error);
        return "Check your internet connection. I couldn't reach the server.";
    }
};
