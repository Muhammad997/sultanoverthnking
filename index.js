const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const NOMOR_HP_BOT = '6288211898831'; 

const randomJokes = [
    "Kenapa ayam kalau berkokok matanya merem? Soalnya udah hafal teksnya.",
    "Piring apa yang paling sensitif? Piring-piring cantik, digores dikit nangis.",
    "Kenapa gorengan kalau mateng warnanya cokelat? Kalau ijo mah lumut.",
    "Sepatu, sepatu apa yang bisa jalan sendiri? Sepatutnya kita bersyukur.",
    "Bundaran HI kalau diputerin tiga kali jadinya apa? Jadinya pusing."
];

// Membuat instance Axios kustom dengan Keep-Alive agar koneksi ke API b.ai tetap terbuka & cepat
const aiApiClient = axios.create({
    baseURL: 'https://api.b.ai/v1',
    timeout: 8000, // Membatasi nunggu maksimal 8 detik biar bot gak hang
    headers: {
        'Authorization': `Bearer ${process.env.BAI_APIKEY}`, 
        'Content-Type': 'application/json'
    }
});

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
            // [OPTIMALISASI 1] Langsung kirim efek mengetik ke user (Real-time feedback)
            await chat.sendStateTyping();

            // [OPTIMALISASI 2] Memanggil API dengan client yang sudah terkonfigurasi Keep-Alive
            const response = await aiApiClient.post('/chat/completions', {
                model: 'glm-5.2',
                messages: [
                    { 
                        role: 'system', 
                        content: `Nama kamu adalah "Sutan Overthinking". Kamu adalah bot WhatsApp super kocak parah dan suka ngasih jawaban di luar nalar. Jawablah menggunakan bahasa gaul. Selipkan joke ini jika dirasa lucu: "${jokeBumbu}".` 
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.85
            });

            const aiReply = response.data.choices[0].message.content;

            // [OPTIMALISASI 3] Matikan status mengetik sebelum mengirim pesan
            await chat.clearState();
            await msg.reply(`${aiReply}\n\n---\n*Created by Muhammad Sulaiman*`);

        } catch (error) {
            console.error('API Error:', error.message);
            await chat.clearState();
            await msg.reply('Aduh, otak gua korslet! Coba lagi nanti.\n\n---\n*Created by Muhammad Sulaiman*');
        }
    }
});

client.initialize();
