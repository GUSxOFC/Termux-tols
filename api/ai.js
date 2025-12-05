import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY tidak ditemukan. Atur di Vercel.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        console.log("INFO: Sedang mencari daftar model yang tersedia...");
        
        // Ini adalah perintah detektifnya
        const response = await genAI.listModels();
        const models = response.models;

        console.log("SUKSES: Daftar model ditemukan!");
        
        // Cetak daftar model ke log Vercel
        models.forEach(model => {
            console.log(`- Nama Model: ${model.name}, Versi API: ${model.version}, Metode: ${model.supportedGenerationMethods.join(', ')}`);
        });

        res.status(200).json({ 
            type: "text", 
            data: "Detektif selesai bekerja. Silakan cek log Vercel untuk melihat daftar model yang tersedia." 
        });

    } catch (error) {
        console.error("ERROR: Detektif gagal bekerja:", error.message);
        res.status(500).json({ error: `Detektif gagal: ${error.message}` });
    }
};
