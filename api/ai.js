export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.GOOGLE_AI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "GOOGLE_AI_API_KEY tidak ditemukan. Atur di Vercel." });
    }

    // Kita menggunakan model yang paling stabil dan alamat API yang pasti benar
    const MODEL_NAME = "gemini-pro"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
        const { prompt } = req.body;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(errorData.error?.message || `Gagal memanggil API Gemini (Status: ${apiResponse.status})`);
        }

        const data = await apiResponse.json();
        const text = data.candidates[0].content.parts[0].text;

        res.status(200).json({ type: "text", data: text });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
};
