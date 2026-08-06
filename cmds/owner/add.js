let handler = async (m, { conn, args, command, usedPrefix }) => {
try {
let who2 = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : null
if (!who2) return conn.reply(m.chat, '❀ Por favor, menciona al usuario o cita un mensaje.', m)

// Fix LID de WhatsApp nuevo
let who = who2
if (who.includes('@lid')) {
try {
let res = await conn.onWhatsApp(who)
who = res && res[0]?.jid || who2
} catch { who = who2 }
}

let botId = conn.user.jid
let botSettings = global.db.data.settings[botId] || {}
let currency = botSettings.currency || 'Coins'

if (command === 'addcoin') {
let coinTxt = args.find(arg =>!isNaN(arg) &&!arg.includes('@'))
if (!coinTxt) return conn.reply(m.chat, `ꕥ Ingresa la cantidad.\nEjemplo: ${usedPrefix}addcoin @usuario 100`, m)
if (isNaN(coinTxt)) return conn.reply(m.chat, 'ꕥ Solo se permiten números.', m)

await m.react('🕒')
let dmt = parseInt(coinTxt)
if (dmt < 1) {
await m.react('✖️')
return conn.reply(m.chat, 'ꕥ Mínimo es *1*', m)
}

if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { users: {} }
if (!global.db.data.chats[m.chat].users) global.db.data.chats[m.chat].users = {}
let userData = global.db.data.chats[m.chat].users
if (!userData[who]) userData[who] = { coins: 0 }
if (!userData[who].coins) userData[who].coins = 0

userData[who].coins += dmt
await m.react('✔️')
return conn.reply(m.chat, `❀ *Añadido:*\n» ${dmt} ${currency}\n@${who.split('@')[0]}, recibiste ${dmt} ${currency}`, m, { mentions: [who] })
}

if (command === 'addxp') {
let xpTxt = args.find(arg =>!isNaN(arg) &&!arg.includes('@'))
if (!xpTxt) return conn.reply(m.chat, `ꕥ Ingresa la cantidad de XP.\nEjemplo: ${usedPrefix}addxp @usuario 50`, m)
if (isNaN(xpTxt)) return conn.reply(m.chat, 'ꕥ Solo números son permitidos.', m)

await m.react('🕒')
let xp = parseInt(xpTxt)
if (xp < 1) {
await m.react('✖️')
return conn.reply(m.chat, 'ꕥ El mínimo de XP es *1*', m)
}

if (!global.db.data.users) global.db.data.users = {}
let userData = global.db.data.users
if (!userData[who]) userData[who] = { exp: 0 }
if (!userData[who].exp) userData[who].exp = 0

userData[who].exp += xp
await m.react('✔️')
return conn.reply(m.chat, `❀ XP Añadido: *${xp}*\n@${who.split('@')[0]}, recibiste ${xp} XP`, m, { mentions: [who] })
}

} catch (e) {
console.error(e)
await m.react('✖️')
return conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n${e.message}`, m)
}
}

handler.help = ['addcoin', 'addxp']
handler.tags = ['owner']
handler.command = /^(addcoin|addxp)$/i
handler.owner = true

export default handler
