const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const NOMOR_HP_BOT = '6288211898831'; 
// =====================================================================

const randomJokes = [
    "Kenapa ayam kalau berkokok matanya merem? Soalnya udah hafal teksnya.",
    "Piring apa yang paling sensitif? Piring-piring cantik, digores dikit nangis.",
    "Kenapa gorengan kalau mateng warnanya cokelat? Kalau ijo mah lumut.",
    "Sepatu, sepatu apa yang bisa jalan sendiri? Sepatutnya kita bersyukur.",
    "Bundaran HI kalau diputerin tiga kali jadinya apa? Jadinya pusing."
];

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: 'new',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    },
    // GANTI BAGIAN INI: Menggunakan strategi lokal agar tidak terpengaruh refresh WA Web
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' 
    }
});
    },
    webVersionCache: { // 3. PENTING! Mencegah error 't: t' dengan mengunci versi WA Web yang stabil
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018591586-alpha.html'
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
    if (msg.from.endsWith('@c.us')) { 
        const userMessage = msg.body;
        const jokeBumbu = randomJokes[Math.floor(Math.random() * randomJokes.length)];

        try {
            const response = await axios.post('https://api.b.ai/v1/chat/completions', {
                model: 'glm-5.2',
                messages: [
                    { 
                        role: 'system', 
                        content: `Nama kamu adalah "Sutan Overthinking". Kamu adalah bot WhatsApp super kocak parah dan suka ngasih jawaban di luar nalar. Jawablah menggunakan bahasa gaul. Selipkan joke ini jika dirasa lucu: "${jokeBumbu}".` 
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.85
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.BAI_APIKEY}`, 
                    'Content-Type': 'application/json'
                }
            });

            const aiReply = response.data.choices[0].message.content;
            await msg.reply(`${aiReply}\n\n---\n*Created by Muhammad Sulaiman*`);

        } catch (error) {
            console.error('API Error:', error.message);
            await msg.reply('Aduh, otak gua korslet! Coba lagi nanti.\n\n---\n*Created by Muhammad Sulaiman*');
        }
    }
});

client.initialize();
