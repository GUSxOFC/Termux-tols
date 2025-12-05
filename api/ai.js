// Tambahkan ini di paling atas untuk mendiagnosa
console.log("INFO: Robot XavAi dimulai...");

// Cek apakah library berhasil di-load
let genAI;
try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = GoogleGenerativeAI;
    console.log("INFO: Library @google/generative-ai berhasil di-load.");
} catch (e) {
    console.error("FATAL: Gagal memuat library @google/generative-ai. Apakah sudah ada di package.json?", e);
    // Jika library gagal di-load, hentikan semuanya
    throw new Error("Library tidak ditemukan. Pastikan 'dependencies' di package.json benar.");
}

// Cek apakah API Key ada
const API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!API_KEY) {
    console.error("FATAL: API Key tidak ditemukan di Environment Variable.");
    throw new Error("GOOGLE_AI_API_KEY tidak ditemukan. Atur di Vercel.");
}

const model = new genAI(API_KEY).getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
    console.log("INFO: Menerima request dari frontend.");

    if (req.method !== 'POST') {
        console.warn("WARN: Request bukan POST.");
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        console.log("INFO: Prompt diterima:", prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("SUKSES: Berhasil mendapat respon dari Gemini.");
        res.status(200).json({ type: "text", data: text });

    } catch (error) {
        // Jika terjadi error saat memanggil Gemini, tampilkan error aslinya
        console.error("ERROR: Gagal memanggil Gemini API:", error.message);
        res.status(500).json({ error: `Gagal memanggil Gemini: ${error.message}` });
    }
};
