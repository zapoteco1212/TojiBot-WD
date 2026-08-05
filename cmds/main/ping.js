let handler = async (m, { conn }) => {
let start = new Date().getTime()
let sent = await conn.sendMessage(m.chat, { text: '`❏ ¡Pong!`\n> *TojiBot-WD*' }, { quoted: m })
let latency = new Date().getTime() - start

await conn.sendMessage(m.chat, { 
text: `✿ *Pong!*\n> Tiempo ⴵ ${latency}ms\n> Bot: ${global.db.data.settings[conn.user.jid]?.namebot || 'TojiBot-WD'}`, 
edit: sent.key 
}, { quoted: m })
}

handler.help = ['ping', 'p']
handler.tags = ['info']
handler.command = /^(ping|p)$/i

export default handler
