export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.GOOGLE_AI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "GOOGLE_AI_API_KEY tidak ditemukan. Atur di Vercel." });
    }

    try {
        const { prompt } = req.body;

        // LANGKAH 1: Robot mencari model Gemini yang cocok secara OTOMATIS
        console.log("INFO: Robot sedang mencari model yang tersedia...");
        const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const listResponse = await fetch(listModelsUrl);
        const modelData = await listResponse.json();
        
        let targetModelName = null;
        
        // Cari model text-based (generateContent) yang mengandung 'gemini'
        for (const model of modelData.models) {
            if (model.supportedGenerationMethods.includes('generateContent') && model.name.includes('gemini')) {
                targetModelName = model.name; // Gunakan yang pertama kali ditemukan
                console.log(`SUKSES: Robot menemukan model yang tepat: ${targetModelName}`);
                break; 
            }
        }

        if (!targetModelName) {
            throw new Error("Robot tidak menemukan model Gemini yang cocok.");
        }

        // LANGKAH 2: Gunakan model yang sudah ditemukan untuk ngobrol
        const generateContentUrl = `https://generativelanguage.googleapis.com/v1beta/${targetModelName}:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const apiResponse = await fetch(generateContentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(errorData.error?.message || `Gagal memanggil API Gemini.`);
        }

        const data = await apiResponse.json();
        const text = data.candidates[0].content.parts[0].text;

        res.status(200).json({ type: "text", data: text });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
};
