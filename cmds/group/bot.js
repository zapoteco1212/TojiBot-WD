let handler = async (m, { conn, args }) => {
if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
const chat = global.db.data.chats[m.chat]
if (chat.isBanned == null) chat.isBanned = false

const idBot = conn.user.jid
const botname = global.db.data.settings[idBot]?.namebot || 'TojiBot'
const estado = chat.isBanned?? false

if (args[0] === 'off') {
if (estado) return conn.reply(m.chat, '《✧》 El *Bot* ya estaba *desactivado* en este grupo.', m)
chat.isBanned = true
return conn.reply(m.chat, `《✧》 Has *Desactivado* a *${botname}* en este grupo.`, m)
}

if (args[0] === 'on') {
if (!estado) return conn.reply(m.chat, `《✧》 *${botname}* ya estaba *activado* en este grupo.`, m)
chat.isBanned = false
return conn.reply(m.chat, `《✧》 Has *Activado* a *${botname}* en este grupo.`, m)
}

return conn.reply(m.chat, `*✿ Estado de ${botname} (｡•́‿•̀｡)*\n✐ *Actual ›* ${estado? '✗ Desactivado' : '✓ Activado'}\n\n✎ Puedes cambiarlo con:\n> ● _Activar ›_ *bot on*\n> ● _Desactivar ›_ *bot off*`, m)
}

handler.help = ['bot on', 'bot off']
handler.tags = ['grupo']
handler.command = /^(bot)$/i
handler.admin = true
handler.group = true

export default handler
