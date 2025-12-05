// !!! PERINGATAN: API KEY DITARUH DI SINI. TIDAK AMAN UNTUK PRODUKSI !!!
const API_KEY = "sk-5a44bbe9dfe644cba441ca9d82660c54"; // <--- GANTI DENGAN API KEY ANDA
const BASE_URL = "https://api.deepseek.com";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!API_KEY) return res.status(500).json({ error: "API Key tidak ditemukan." });

    try {
        const { prompt } = req.body;
        const headers = { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" };

        if (prompt.toLowerCase().startsWith('gambar:')) {
            const imagePrompt = prompt.substring('gambar:'.length).trim();
            await handleImageGeneration(imagePrompt, headers, res);
        } else if (prompt.toLowerCase().startsWith('code:') || prompt.toLowerCase().startsWith('kode:')) {
            const codePrompt = `Tulis kode untuk: ${prompt.substring(prompt.indexOf(':') + 1).trim()}. Berikan hanya kode.`;
            await handleChatCompletion(codePrompt, headers, "deepseek-coder", res);
        } else {
            await handleChatCompletion(prompt, headers, "deepseek-chat", res);
        }
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
}

async function handleChatCompletion(prompt, headers, model, res) {
    const payload = { model: model, messages: [{ role: "system", content: "Kamu adalah XavAi." }, { role: "user", content: prompt }], stream: false };
    const apiResponse = await fetch(`${BASE_URL}/v1/chat/completions`, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
    if (!apiResponse.ok) throw new Error(`DeepSeek API error: ${await apiResponse.text()}`);
    const result = await apiResponse.json();
    const content = result.choices[0].message.content;
    const contentType = (content.includes('def ') || content.includes('function') || content.includes('class ')) ? 'code' : 'text';
    res.status(200).json({ type: contentType, data: content });
}

async function handleImageGeneration(prompt, headers, res) {
    const payload = { model: "deepseek-image", prompt: prompt, response_format: "b64_json" };
    const apiResponse = await fetch(`${BASE_URL}/v1/images/generations`, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
    if (!apiResponse.ok) throw new Error(`DeepSeek API error: ${await apiResponse.text()}`);
    const result = await apiResponse.json();
    res.status(200).json({ type: "image", data: result.data[0].b64_json });
}
