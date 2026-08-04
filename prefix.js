const PREFIJO = '!'; 

client.on('message', async (msg) => {
    const texto = msg.body;

    if (!texto.startsWith(PREFIJO)) return;

    const args = texto.slice(PREFIJO.length).trim().split(/ +/);
    const comando = args.shift().toLowerCase();

    if (comando === 'ping') {
        await msg.reply('pong! 🏓');
    }
});
