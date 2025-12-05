// Ambil API Key dari Environment Variable yang sudah Anda atur di Vercel
const API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
    // --- Langkah 1: Cek apakah fungsi ini dipanggil ---
    console.log("INFO: Fungsi /api/openai berhasil dipanggil.");

    // --- Langkah 2: Cek metode request ---
    if (req.method !== 'POST') {
        console.log("ERROR: Metode bukan POST.");
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- Langkah 3: Cek apakah API Key ada ---
    if (!API_KEY) {
        console.error("FATAL: API Key OPENAI_API_KEY tidak ditemukan di Environment Variable Vercel.");
        return res.status(500).json({ error: "Konfigurasi server salah: API Key tidak ada." });
    }

    try {
        const { prompt } = req.body;
        console.log("INFO: Menerima prompt:", prompt);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Pakai model yang lebih murah dan stabil untuk tes
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("ERROR dari OpenAI:", data);
            throw new Error(data.error?.message || 'Error tidak diketahui dari OpenAI.');
        }

        console.log("SUKSES: Berhasil mendapat respon dari OpenAI.");
        res.status(200).json({ data: data.choices[0].message.content });

    } catch (error) {
        console.error("CRASH: Fungsi mengalami crash:", error.message);
        res.status(500).json({ error: `Terjadi kesalahan di server: ${error.message}` });
    }
};
