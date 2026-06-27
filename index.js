const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Inisialisasi Bot WA
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Wajib untuk Railway
    }
});

// Generate QR Code di Terminal buat login pertama kali
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- SCAN QR CODE INI DI WHATSAPP KAMU ---');
});

client.on('ready', () => {
    console.log('🤖 Bot WA Kocak udah siap narik mang!');
});

// Handle Pesan Masuk
client.on('message', async (msg) => {
    // Biar gak nyaut di grup secara brutal, kita setel buat chat pribadi dulu aja
    // Atau kalau mau di grup, bisa pake kondisi khusus (misal: panggil namanya)
    if (msg.from.endsWith('@c.us')) { 
        
        const userMessage = msg.body;
        
        // Panggil API GLM-5.2 via B.AI
        try {
            const response = await axios.post('https://api.b.ai/v1/chat/completions', { // Sesuaikan URL endpoint B.AI kamu
                model: 'glm-5.2',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Nama kamu adalah "Sutan Overthinking". Kamu adalah bot WhatsApp yang super lucu, kocak parah, sarkas tapi jenaka, suka pakai bahasa gaul/slang Indonesia, dan selalu ngasih jawaban yang di luar nalar atau overthinking tingkat dewa. Jangan kaku, jawab pendek-pendek dan bikin ketawa!' 
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.8 // Biar makin kreatif & ngaco jawabannya
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.BAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const replyText = response.data.choices[0].message.content;
            await msg.reply(replyText);

        } catch (error) {
            console.error('Error nembak API:', error.message);
            await msg.reply('Aduh, otak gua lagi konslet (API Error). Coba lagi nanti deh!');
        }
    }
});

client.initialize();
