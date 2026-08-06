let handler = async (m, { conn, args, usedPrefix, command }) => {
const idBot = conn.user.jid
if (!global.db.data.settings[idBot]) global.db.data.settings[idBot] = {}
const config = global.db.data.settings[idBot]

const isOwner2 = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)

if (!isOwner2 &&!m.isROwner &&!m.isOwner) {
return conn.reply(m.chat, mess.socket || '❌ Solo el socket puede usar este comando.', m)
}

const db = global.db.data
const botId = conn.user.jid
const isOwner = db.settings[botId]?.owner
const isSocketOwner = [botId,...(isOwner? [isOwner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)

if (!isSocketOwner &&!m.isROwner) return conn.reply(m.chat, mess.socket || '❌ Solo el socket puede usar este comando.', m)

const groupId = args[0] || m.chat

try {
await conn.groupLeave(groupId)
await conn.reply(m.chat, `✿ Salí del grupo *${groupId}* correctamente.`, m)
} catch (e) {
return conn.reply(m.chat, `> Ocurrió un error inesperado al ejecutar *${usedPrefix + command}*.\n> [Error: *${e.message}*]`, m)
}
}

handler.help = ['leave']
handler.tags = ['socket']
handler.command = /^(leave|salir|out)$/i
handler.owner = true
handler.rowner = true

export default handler
