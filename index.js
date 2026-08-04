// Dependiendo de tu librería (baileys o whatsapp-web.js), importa tu cliente aquí.
// Ejemplo común con whatsapp-web.js:
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
    console.log(`Mensaje recibido: ${texto}`); // Esto te imprimirá en la consola de Termux si lee los mensajes

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
