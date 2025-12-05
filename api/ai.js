export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.GOOGLE_AI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "GOOGLE_AI_API_KEY tidak ditemukan. Atur di Vercel." });
    }

    // Ini adalah alamat rahasia untuk mencuri daftar model
    const LIST_MODELS_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        console.log("INFO: Agen rahasia sedang menyusup ke markas Google...");
        
        const response = await fetch(LIST_MODELS_URL);

        if (!response.ok) {
            throw new Error(`Gagal menyusup! Status: ${response.status}`);
        }

        const data = await response.json();
        const models = data.models;

        console.log("SUKSES! Daftar model berhasil dicuri! Cetak ke log...");
        
        // Cetak daftar model yang benar-benar ada ke log Vercel
        models.forEach(model => {
            console.log(`- Model ID: ${model.name}, Metode: ${model.supportedGenerationMethods.join(', ')}`);
        });

        res.status(200).json({ 
            type: "text", 
            data: "Agen rahasia berhasil! Silakan cek log Vercel untuk melihat daftar model asli dari Google." 
        });

    } catch (error) {
        console.error("ERROR: Agen rahasia gagal bertugas:", error.message);
        res.status(500).json({ error: `Agen rahasia gagal: ${error.message}` });
    }
};
