import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY tidak ditemukan. Atur di Vercel.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
// GANTI MODEL KE YANG LEBIH STABIL
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt } = req.body;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ type: "text", data: text });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
};
