import GraphemeSplitter from 'grapheme-splitter'

let handler = async (m, { conn, args, usedPrefix, command }) => {
const idBot = conn.user.jid
const config = global.db.data.settings[idBot]
if (!config) global.db.data.settings[idBot] = {}
const settings = global.db.data.settings[idBot]

const sender = m.sender
const isOwner2 = [idBot,...(settings.owner? [settings.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender)

if (!isOwner2 &&!m.isROwner &&!m.isOwner) {
return conn.reply(m.chat, mess.socket || '❌ Solo el socket puede usar este comando.', m)
}

const value = args.join(' ').trim()
const defaultPrefix = ["#", "/", "!", "."]

if (!value) {
const lista = settings.prefix === true? '`sin prefijos`' : (Array.isArray(settings.prefix)? settings.prefix : [settings.prefix || '/']).map(p => `\`${p}\``).join(', ')
return conn.reply(m.chat, `❀ Por favor, elige cualquiera de los siguientes métodos de prefijos.\n\n> *○ Only-Prefix* » ${usedPrefix + command} *.*\n> *○ Multi-Prefix* » ${usedPrefix + command} *!/.#*\n> *○ No-Prefix* » ${usedPrefix + command} *noprefix*\n\nꕥ Actualmente se está usando: ${lista}`, m)
}

if (value.toLowerCase() === 'reset') {
settings.prefix = defaultPrefix
return conn.reply(m.chat, `❀ Se han restaurado los prefijos predeterminados: *${defaultPrefix.join(' ')}*`, m)
}

if (value.toLowerCase() === 'noprefix') {
settings.prefix = true
return conn.reply(m.chat, `❀ Se cambio al modo sin prefijos para el Socket correctamente\n> Ahora el bot responderá a comandos *sin prefijos*.`, m)
}

const splitter = new GraphemeSplitter()
const graphemes = splitter.splitGraphemes(value)
const lista = []
for (const g of graphemes) {
if (/^[a-zA-Z]+$/.test(g)) continue
if (!lista.includes(g)) lista.push(g)
}

if (lista.length === 0) return conn.reply(m.chat, 'ꕥ No se detectaron prefijos válidos. Debes incluir al menos un símbolo o emoji.', m)
if (lista.length > 6) return conn.reply(m.chat, 'ꕥ Máximo 6 prefijos permitidos.', m)

settings.prefix = lista
return conn.reply(m.chat, `❀ Se cambió el prefijo del Socket a *${lista.join(' ')}* correctamente.`, m)
}

handler.help = ['setprefix', 'setbotprefix']
handler.tags = ['socket']
handler.command = /^(setprefix|setbotprefix)$/i
handler.owner = true
handler.rowner = true

export default handler
