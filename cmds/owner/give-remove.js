import { resolveLidToRealJid } from "../lib/utils.js"

let handler = async (m, { conn, args, usedPrefix, command }) => {
try {
let type = args[0]?.toLowerCase()

// Solo owners pueden dar/quitar XP
if (type === 'xp' || type === 'exp') {
let senderNum = m.sender.split('@')[0]
let isOwner = m.isOwner || m.isROwner || false

if (global.owner) {
for (const o of global.owner) {
let oNum = Array.isArray(o)? o[0] : o
if (oNum && oNum.toString() === senderNum) {
isOwner = true
break
}
}
}

if (!isOwner) {
await m.react('✖️')
return conn.reply(m.chat, 'ꕥ Lo siento, solo mis creadores (Owners) pueden gestionar la XP.', m)
}
}

let mentioned = m.mentionedJid
let who2 = mentioned.length > 0? mentioned[0] : (m.quoted? m.quoted.sender : null)

if (!who2) return conn.reply(m.chat, `❀ Debes mencionar a alguien o responder a un mensaje.\nUso: *${usedPrefix}${command} [tipo] [cantidad] @user*`, m)

let who = await resolveLidToRealJid(who2, conn, m.chat)
let botId = conn.user.jid
let botSettings = global.db.data.settings[botId] || {}
let currency = botSettings.currency || 'Coins'
let valInput = args[1]

if (!type ||!valInput) return conn.reply(m.chat, `ꕥ Formato incorrecto.\nEj: \`${usedPrefix}${command} coins 100 @user\` o \`xp 10L @user\``, m)

let isLevel = valInput.toLowerCase().endsWith('l')
let cantidad = parseInt(isLevel? valInput.replace(/l/gi, '') : valInput)

if (isNaN(cantidad)) return conn.reply(m.chat, 'ꕥ La cantidad debe ser un número válido.', m)

if (command === 'remove') cantidad = -Math.abs(cantidad)

await m.react('🕒')

let mensaje = ''

if (type === 'coin' || type === 'coins' || type === 'monedas') {
if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { users: {} }
if (!global.db.data.chats[m.chat].users) global.db.data.chats[m.chat].users = {}
let userData = global.db.data.chats[m.chat].users
if (!userData[who]) userData[who] = { coins: 0 }

userData[who].coins += cantidad
mensaje = `❀ *${cantidad >= 0? 'Añadido' : 'Retirado'}:*\n» ${Math.abs(cantidad).toLocaleString()} ${currency}\n@${who.split('@')[0]}, tu nuevo saldo es: ${userData[who].coins.toLocaleString()} ${currency}`

} else if (type === 'xp' || type === 'exp') {
if (!global.db.data.users) global.db.data.users = {}
if (!global.db.data.users[who]) global.db.data.users[who] = { exp: 0, level: 0 }
let userData = global.db.data.users[who]

if (isLevel) {
userData.level = (userData.level || 0) + cantidad
mensaje = `❀ *Nivel ${cantidad >= 0? 'Subido' : 'Bajado'}:*\n» ${Math.abs(cantidad)} Niveles\n@${who.split('@')[0]} ahora es Nivel ${userData.level}`
} else {
userData.exp = (userData.exp || 0) + cantidad
mensaje = `❀ *XP ${cantidad >= 0? 'Añadido' : 'Retirado'}:*\n» ${Math.abs(cantidad).toLocaleString()} XP\n@${who.split('@')[0]} recibió ${cantidad} XP`
}
} else {
await m.react('✖️')
return conn.reply(m.chat, 'ꕥ Tipo no válido. Usa: *coin* o *xp*.', m)
}

await m.react('✔️')
return conn.reply(m.chat, mensaje, m, { mentions: [who] })

} catch (error) {
console.error(error)
await m.react('✖️')
return conn.reply(m.chat, `⚠︎ Error crítico:\n${error.message}`, m)
}
}

handler.help = ['give', 'remove']
handler.tags = ['economy']
handler.command = /^(give|remove)$/i
handler.admin = true
handler.group = true

export default handler
