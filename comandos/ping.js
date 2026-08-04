export default {
    name: 'ping',
    async run(msg, client, usedprefix) {
        await msg.reply('pong! 🏓');
    }
};