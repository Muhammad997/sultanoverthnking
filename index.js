const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenAI } = require('@google/generative-ai'); 

const NOMOR_HP_BOT = '6288211898831'; 

const randomJokes = [
    "Kenapa ayam kalau berkokok matanya merem? Soalnya udah hafal teksnya.",
    "Piring apa yang paling sensitif? Piring-piring cantik, digores dikit nangis.",
    "Kenapa gorengan kalau mateng warnanya cokelat? Kalau ijo mah lumut.",
    "Sepatu, sepatu apa yang bisa jalan sendiri? Sepatutnya kita bersyukur.",
    "Bundaran HI kalau diputerin tiga kali jadinya apa? Jadinya pusing."
];


const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
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
            '--no-zygote',
            '--remote-debugging-port=9222'
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
    if (msg.from.endsWith('@c.us')) { 
        const userMessage = msg.body;
        const jokeBumbu = randomJokes[Math.floor(Math.random() * randomJokes.length)];
        
        const chat = await msg.getChat();

        try {
            await chat.sendStateTyping();

            const model = ai.getGenerativeModel({ 
                model: 'gemini-1.5-flash',
                systemInstruction: `Nama kamu adalah "Sutan Overthinking". Kamu adalah bot WhatsApp super kocak parah dan suka ngasih jawaban di luar nalar. Jawablah menggunakan bahasa gaul. Selipkan joke ini jika dirasa lucu: "${jokeBumbu}".`
            });

            const result = await model.generateContent(userMessage);
            const response = await result.response;
            const aiReply = response.text();

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
