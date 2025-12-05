const API_KEY = process.env.OPENAI_API_KEY; // Mengambil dari Environment Variable Vercel
const BASE_URL = "https://api.openai.com/v1";

export default async function handler(req, res) {
    // ... (sisanya kode sama seperti sebelumnya)
    // Saya akan tulis ulang lengkap agar tidak ada yang salah
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    if (!API_KEY) {
        return res.status(500).json({ error: "API Key tidak ditemukan. Pastikan Environment Variable OPENAI_API_KEY sudah diatur di Vercel." });
    }

    try {
        const { prompt } = req.body;
        const headers = {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        };

        if (prompt.toLowerCase().startsWith('gambar:')) {
            const imagePrompt = prompt.substring('gambar:'.length).trim();
            await handleImageGeneration(imagePrompt, headers, res);
        } else if (prompt.toLowerCase().startsWith('code:') || prompt.toLowerCase().startsWith('kode:')) {
            const codePrompt = `Tulis kode yang lengkap dan fungsional untuk: ${prompt.substring(prompt.indexOf(':') + 1).trim()}. Berikan hanya kode, tanpa penjelasan.`;
            await handleChatCompletion(codePrompt, headers, "gpt-4o", res);
        } else {
            await handleChatCompletion(prompt, headers, "gpt-4o-mini", res);
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
            { role: "system", content: "Kamu adalah XavAi, asisten AI yang ramah, cerdas, dan keren." },
            { role: "user", content: prompt }
        ],
    };
    const apiResponse = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!apiResponse.ok) throw new Error(`OpenAI API error: ${await apiResponse.text()}`);
    const result = await apiResponse.json();
    const content = result.choices[0].message.content;
    const contentType = (content.includes('def ') || content.includes('function') || content.includes('class ')) ? 'code' : 'text';
    res.status(200).json({ type: contentType, data: content });
}

async function handleImageGeneration(prompt, headers, res) {
    const payload = {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
    };
    const apiResponse = await fetch(`${BASE_URL}/images/generations`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!apiResponse.ok) throw new Error(`OpenAI API error: ${await apiResponse.text()}`);
    const result = await apiResponse.json();
    res.status(200).json({ type: "image", data: result.data[0].url });
}
