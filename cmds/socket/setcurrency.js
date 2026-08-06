let handler = async (m, { conn, args, usedPrefix, command }) => {
const idBot = conn.user.jid
if (!global.db.data.settings[idBot]) global.db.data.settings[idBot] = {}
const config = global.db.data.settings[idBot]

const isOwner2 = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)

if (!isOwner2 &&!m.isROwner &&!m.isOwner) {
return conn.reply(m.chat, mess.socket || '❌ Solo el socket puede usar este comando.', m)
}

const value = args.join(' ').trim()
if (!value) return conn.reply(m.chat, `✐ Debes escribir un nombre de moneda valido.\n> Ejemplo: *${usedPrefix + command} Coins*`, m)

config.currency = value
return conn.reply(m.chat, `✿ Se ha cambiado la moneda del bot a *${value}*`, m)
}

handler.help = ['setbotcurrency', 'setcurrency']
handler.tags = ['socket']
handler.command = /^(setbotcurrency|setcurrency)$/i
handler.owner = true
handler.rowner = true

export default handler
