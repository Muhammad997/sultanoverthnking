const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Kumpulan jokes bapak-bapak / random buat tambahan renyah
const randomJokes = [
    "Kenapa ayam kalau berkokok matanya merem? Soalnya udah hafal teksnya.",
    "Piring apa yang paling sensitif? Piring-piring cantik, digores dikit nangis.",
    "Kenapa gorengan kalau mateng warnanya cokelat? Kalau ijo mah lumut.",
    "Sepatu, sepatu apa yang bisa jalan sendiri? Sepatutnya kita bersyukur.",
    "Bundaran HI kalau diputerin tiga kali jadinya apa? Jadinya pusing.",
    "Kenapa donat tengahnya bolong? Kalau utuh namanya bakpao, dong.",
    "Uang kalau dilempar jadi apa? Jadi rebutan, lah!"
];

// Inisialisasi Bot WA
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Wajib untuk Railway
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- SCAN QR CODE INI ---');
});

client.on('ready', () => {
    console.log('🤖 Bot WA Kocak Muhammad Sulaiman udah aktif!');
});

client.on('message', async (msg) => {
    // Merespon chat pribadi
    if (msg.from.endsWith('@c.us')) { 
        const userMessage = msg.body;
        
        // Ambil 1 joke random buat bumbu AI
        const jokeBumbu = randomJokes[Math.floor(Math.random() * randomJokes.length)];

        try {
            const response = await axios.post('https://api.b.ai/v1/chat/completions', {
                model: 'glm-5.2',
                messages: [
                    { 
                        role: 'system', 
                        content: `Nama kamu adalah "Sutan Overthinking". Kamu adalah bot WhatsApp super lucu, kocak parah, dan suka ngasih jawaban di luar nalar. Jawablah dengan gaya bahasa gaul/slang. Sebagai inspirasi komedi, ini ada info tambahan joke hari ini: "${jokeBumbu}". Padukan kegilaanmu dengan joke tersebut jika nyambung!` 
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.85
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.BAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiReply = response.data.choices[0].message.content;
            
            // Gabungkan balasan AI dengan watermark pencipta
            const finalReply = `${aiReply}\n\n---\n*Created by Muhammad Sulaiman*`;
            
            await msg.reply(finalReply);

        } catch (error) {
            console.error('Error:', error.message);
            await msg.reply('Aduh, sirkuit otak gua korslet! Coba lagi nanti.\n\n---\n*Created by Muhammad Sulaiman*');
        }
    }
});

client.initialize();
