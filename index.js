import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const client = new Client({
    authStrategy: new LocalAuth()
});

const PREFIJO = '!';

client.on('qr', (qr) => {
    console.log('Escanea este código QR por favor:');
});

client.on('ready', () => {
    console.log('¡Bot conectado y listo en Termux! 🚀');
});

client.on('message', async (msg) => {
    const texto = msg.body;
    console.log(`Mensaje recibido: ${texto}`);

    if (!texto.startsWith(PREFIJO)) return;

    const args = texto.slice(PREFIJO.length).trim().split(/ +/);
    const comando = args.shift().toLowerCase();

    if (comando === 'ping') {
        await msg.reply('pong! 🏓');
    }

    if (comando === 'fix') {
        await msg.reply('🔄 Reiniciando bot...');
        process.exit(0);
    }
});

client.initialize();
