const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})(?:\s+[0-9]{1,3})?/i

async function getGroupName(conn, chatId) {
try {
let metadata = await conn.groupMetadata(chatId)
return metadata.subject || 'Grupo desconocido'
} catch {
return 'Chat privado'
}
}

function msToTime(duration) {
let seconds = Math.floor((duration / 1000) % 60)
let minutes = Math.floor((duration / (1000 * 60)) % 60)
minutes = minutes < 10? '0' + minutes : minutes
seconds = seconds < 10? '0' + seconds : seconds
return `${minutes} Minuto(s) ${seconds} Segundo(s)`
}

let handler = async (m, { conn, args, isGroup }) => {
let chat = global.db.data.chats[m.chat] || {}
if (!chat.users) chat.users = {}
if (!chat.users[m.sender]) chat.users[m.sender] = {}
let user = chat.users[m.sender]
if (!user.jointime) user.jointime = 0

let grupo = isGroup? await getGroupName(conn, m.chat) : 'Chat privado'
let botId = conn.user.jid
let botSettings = global.db.data.settings[botId] || {}
let botname = botSettings.namebot || botSettings.botname || 'TojiBot-WD'
let link = botSettings.link || global.link || ''
let dueño = botSettings.owner || global.owner[0][0] + '@s.whatsapp.net'

const cooldown = 600000
const nextTime = user.jointime + cooldown
if (new Date() - user.jointime < cooldown) {
return conn.reply(m.chat, `ꕥ Espera *${msToTime(nextTime - new Date())}* para volver a enviar otra invitacion.`, m)
}

if (!args ||!args.length) {
return conn.reply(m.chat, '《✧》 Ingresa el enlace para invitar al bot a tu grupo.', m)
}

let linkArg = args.join(' ')
let match = linkArg.match(linkRegex)
if (!match ||!match[1]) {
return conn.reply(m.chat, '《✧》 El enlace ingresado no es válido o está incompleto.', m)
}

let isOficialBot = botId === (global.conn?.user?.jid || conn.user.jid)
let botType = isOficialBot? 'Principal/Owner' : 'Sub Bot'

let pp = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg')
let userName = global.db.data.users[m.sender]?.name || m.pushName || 'Usuario'

let sugg = `❀ 𝗦𝗢𝗟𝗜𝗖𝗜𝗧𝗨𝗗 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔

✩ *Usuario ›* ${userName}
✿ *Enlace ›* ${args.join(' ')}
✿ *Chat ›* ${grupo}

➤ 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧
♡ *Socket ›* ${botType}
★ *Nombre ›* ${botname}
❐ *Versión ›* ${global.version || '1.0.0'}`

if (isOficialBot) {
let lista = dueño? [dueño] : global.owner.map(v => v[0] + '@s.whatsapp.net')
for (let destino of lista) {
try {
await conn.sendMessage(destino, {
image: { url: pp },
caption: sugg,
contextInfo: {
externalAdReply: {
title: 'ꕥ Invitación',
body: '✿ New invitation to the Socket.',
thumbnailUrl: pp,
sourceUrl: link,
mediaType: 1
}
}
})
} catch {}
}
} else {
try {
await conn.sendMessage(dueño, {
image: { url: pp },
caption: sugg,
contextInfo: {
externalAdReply: {
title: 'ꕥ Invitación',
body: '✿ New invitation to the Socket.',
thumbnailUrl: pp,
sourceUrl: link,
mediaType: 1
}
}
})
} catch {}
}

await conn.reply(m.chat, '❀ El enlace fue enviado correctamente. ¡Gracias por tu invitación! ฅ^•ﻌ•^ฅ', m)
user.jointime = new Date() * 1
}

handler.help = ['invite', 'invitar']
handler.tags = ['info']
handler.command = /^(invite|invitar)$/i

export default handler
