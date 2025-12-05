// !!! GANTI DENGAN API KEY BARU ANDA DI SINI !!!
const API_KEY = "sk-5a44bbe9dfe644cba441ca9d82660c54"; 
const BASE_URL = "https://api.deepseek.com";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt } = req.body;
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Kamu adalah XavAi, asisten AI yang ramah." },
                    { role: "user", content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }

        const data = await response.json();
        res.status(200).json({ data: data.choices[0].message.content });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
}
