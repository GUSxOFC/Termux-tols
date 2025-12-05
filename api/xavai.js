// Vercel mendukung `fetch` secara native di Node.js versi terbaru
// Jika Anda menggunakan versi lama, Anda mungkin perlu `npm install node-fetch`

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = "https://api.deepseek.com";

export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: "API Key tidak ditemukan. Atur Environment Variable DEEPSEEK_API_KEY di Vercel." });
    }

    try {
        const { prompt } = req.body;
        const headers = {
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json"
        };

        // Deteksi permintaan
        if (prompt.toLowerCase().startsWith('gambar:')) {
            const imagePrompt = prompt.substring('gambar:'.length).trim();
            await handleImageGeneration(imagePrompt, headers, res);
        } else if (prompt.toLowerCase().startsWith('code:') || prompt.toLowerCase().startsWith('kode:')) {
            const codePrompt = `Tulis kode yang lengkap dan fungsional untuk: ${prompt.substring(prompt.indexOf(':') + 1).trim()}. Berikan hanya kode, tanpa penjelasan tambahan.`;
            await handleChatCompletion(codePrompt, headers, "deepseek-coder", res);
        } else {
            // Default ke chat biasa
            await handleChatCompletion(prompt, headers, "deepseek-chat", res);
        }

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
}

async function handleChatCompletion(prompt, headers, model, res) {
    const payload = {
        model: model,
        messages: [
            { role: "system", content: "Kamu adalah XavAi, asisten AI yang ramah, cerdas, dan serba bisa." },
            { role: "user", content: prompt }
        ],
        stream: false
    };

    const apiResponse = await fetch(`${BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`DeepSeek API error: ${errorData.error.message}`);
    }

    const result = await apiResponse.json();
    const content = result.choices[0].message.content;
    const contentType = (content.includes('def ') || content.includes('function') || content.includes('class ')) ? 'code' : 'text';

    res.status(200).json({ type: contentType, data: content });
}

async function handleImageGeneration(prompt, headers, res) {
    const payload = {
        model: "deepseek-image",
        prompt: prompt,
        response_format: "b64_json"
    };

    const apiResponse = await fetch(`${BASE_URL}/v1/images/generations`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`DeepSeek API error: ${errorData.error.message}`);
    }

    const result = await apiResponse.json();
    const imageDataB64 = result.data[0].b64_json;

    res.status(200).json({ type: "image", data: imageDataB64 });
}
