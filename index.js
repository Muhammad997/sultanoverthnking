const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenAI } = require('@google/generative-ai'); // Menggunakan SDK resmi Gemini
const NOMOR_HP_BOT = '6288211898831'; 

const randomJokes = [
    "Kenapa ayam kalau berkokok matanya merem? Soalnya udah hafal teksnya.",
    "Piring apa yang paling sensitif? Piring-piring cantik, digores dikit nangis.",
    "Kenapa gorengan kalau mateng warnanya cokelat? Kalau ijo mah lumut.",
    "Sepatu, sepatu apa yang bisa jalan sendiri? Sepatutnya kita bersyukur.",
    "Bundaran HI kalau diputerin tiga kali jadinya apa? Jadinya pusing."
];

// Inisialisasi Gemini Client menggunakan API Key dari env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: 'new',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote'
        ]
    },
    webVersionCache: { 
        type: 'none'
    }
});

client.on('qr', async (qr) => {
    try {
        const pairingCode = await client.requestPairingCode(NOMOR_HP_BOT);
        console.log('======================================');
        console.log(`KODE PAIRING WHATSAPP KAMU: ${pairingCode}`);
        console.log('======================================');
    } catch (err) {
        console.error('Gagal meminta pairing code:', err);
    }
});

client.on('ready', () => {
    console.log('🤖 Bot WA Kocak Muhammad Sulaiman sudah aktif lewat Pairing!');
});

client.on('message', async (msg) => {
    // Memastikan hanya merespon chat pribadi (bukan grup/status)
    if (msg.from.endsWith('@c.us')) { 
        const userMessage = msg.body;
        const jokeBumbu = randomJokes[Math.floor(Math.random() * randomJokes.length)];
        
        // Dapatkan objek chat untuk memicu status mengetik
        const chat = await msg.getChat();

        try {
            // Langsung kirim efek mengetik ke user
            await chat.sendStateTyping();

            // Memanggil model Gemini (disarankan menggunakan gemini-2.5-flash untuk respon cepat chat bot)
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                config: {
                    // System instruction diletakkan di konfigurasi terpisah pada Gemini SDK
                    systemInstruction: `Nama kamu adalah "Sutan Overthinking". Kamu adalah bot WhatsApp super kocak parah dan suka ngasih jawaban di luar nalar. Jawablah menggunakan bahasa gaul. Selipkan joke ini jika dirasa lucu: "${jokeBumbu}".`,
                    temperature: 0.85,
                },
                contents: userMessage,
            });

            const aiReply = response.text;

            // Matikan status mengetik sebelum mengirim pesan
            await chat.clearState();
            await msg.reply(`${aiReply}\n\n---\n*Created by Muhammad Sulaiman*`);

        } catch (error) {
            console.error('Gemini API Error:', error.message);
            await chat.clearState();
            await msg.reply('Aduh, otak gua korslet! Coba lagi nanti.\n\n---\n*Created by Muhammad Sulaiman*');
        }
    }
});

client.initialize();
