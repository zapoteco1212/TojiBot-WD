import fetch from 'node-fetch'
import chalk from 'chalk'

export async function before(m, { conn }) {
return true
}

// Loader principal - Toji lo carga desde handler
export default async function handleEvents(conn) {
conn.ev.on('group-participants.update', async (anu) => {
try {
const metadata = await conn.groupMetadata(anu.id).catch(() => null)
if (!metadata) return
const groupAdmins = metadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || []
const chat = global?.db?.data?.chats?.[anu.id]
const botId = conn.user.jid
const primaryBotId = chat?.primaryBot
const memberCount = metadata.participants.length
const isSelf = global.db.data.settings[botId]?.self?? false
if (isSelf) return

for (const p of anu.participants) {
const jid = p.phoneNumber || p.id || p
const phone = jid.split('@')[0]
const pp = await conn.profilePictureUrl(jid, 'image').catch(_ => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg')

const mensajes = {
add: chat.sWelcome? `\n┊➤ ${chat.sWelcome.replace(/{usuario}/g, `@${phone}`).replace(/{grupo}/g, `*${metadata.subject}*`).replace(/{desc}/g, metadata?.desc || '✿ Sin Desc ✿')}` : '',
remove: chat.sGoodbye? `\n┊➤ ${chat.sGoodbye.replace(/{usuario}/g, `@${phone}`).replace(/{grupo}/g, `*${metadata.subject}*`).replace(/{desc}/g, metadata?.desc || '✿ Sin Desc ✿')}` : '',
leave: chat.sGoodbye? `\n┊➤ ${chat.sGoodbye.replace(/{usuario}/g, `@${phone}`).replace(/{grupo}/g, `*${metadata.subject}*`).replace(/{desc}/g, metadata?.desc || '✿ Sin Desc ✿')}` : ''
}

const botSettings = global.db.data.settings[botId] || {}
const fakeContext = {
contextInfo: {
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: botSettings.id || global.channelId,
serverMessageId: '0',
newsletterName: botSettings.nameid || botSettings.namebot || 'TojiBot'
},
externalAdReply: {
title: botSettings.namebot || 'TojiBot',
body: global.dev || 'TojiBot-WD',
mediaUrl: null,
description: null,
previewType: 'PHOTO',
thumbnailUrl: botSettings.icon,
sourceUrl: botSettings.link,
mediaType: 1,
renderLargerThumbnail: false
},
mentionedJid: [jid]
}
}

if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
const caption = `╭┈──̇─̇─̇────̇─̇─̇──◯◝
┊「 *Bienvenido (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)* 」
┊︶︶︶
┊ *Nombre ›* @${phone}
┊ *Grupo ›* ${metadata.subject}
┊┈─────̇─̇─̇─────◯◝
┊➤ *Usa /menu para ver los comandos.*
┊➤ *Ahora somos ${memberCount} miembros.* ${mensajes[anu.action]}
┊ ︿︿︿︿︿︿︿︿︿︿︿
╰─────────────────╯`
await conn.sendMessage(anu.id, { image: { url: pp }, caption,...fakeContext })
}

if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
const caption = `╭┈──̇─̇─̇────̇─̇─̇──◯◝
┊「 *Hasta pronto (⁠╥⁠﹏⁠╥⁠)* 」
┊︶︶︶
┊ *Nombre ›* @${phone}
┊ *Grupo ›* ${metadata.subject}
┊┈─────̇─̇─̇─────◯◝
┊➤ *Ojalá que vuelva pronto.*
┊➤ *Ahora somos ${memberCount} miembros.* ${mensajes[anu.action]}
┊ ︿︿︿︿︿
╰─────────────────╯`
await conn.sendMessage(anu.id, { image: { url: pp }, caption,...fakeContext })
}

if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
const usuario = anu.author
await conn.sendMessage(anu.id, { text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${usuario.split('@')[0]}.*`, mentions: [jid, usuario,...groupAdmins.map(v => v.id)] })
}

if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
const usuario = anu.author
await conn.sendMessage(anu.id, { text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${usuario.split('@')[0]}.*`, mentions: [jid, usuario,...groupAdmins.map(v => v.id)] })
}
}
} catch (err) {
console.log(chalk.gray(`[ BOT ] → ${err}`))
}
})

conn.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0]
if (!m.messageStubType) return
const id = m.key.remoteJid
const chat = global.db.data.chats[id]
const botId = conn.user.jid
const primaryBotId = chat?.primaryBot
if (!chat?.alerts || (primaryBotId && primaryBotId!== botId)) return
const isSelf = global.db.data.settings[botId]?.self?? false
if (isSelf) return
const actor = m.key?.participant || m.participant || m.key?.remoteJid
const phone = actor.split('@')[0]
const groupMetadata = await conn.groupMetadata(id).catch(() => null)
const groupAdmins = groupMetadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || []

if (m.messageStubType == 21) {
await conn.sendMessage(id, { text: `「✎」 @${phone} cambió el nombre del grupo a *${m.messageStubParameters[0]}*`, mentions: [actor,...groupAdmins.map(v => v.id)] })
}
if (m.messageStubType == 22) {
await conn.sendMessage(id, { text: `「✎」 @${phone} cambió el icono del grupo.`, mentions: [actor,...groupAdmins.map(v => v.id)] })
}
if (m.messageStubType == 23) {
await conn.sendMessage(id, { text: `「✎」 @${phone} restableció el enlace del grupo.`, mentions: [actor,...groupAdmins.map(v => v.id)] })
}
if (m.messageStubType == 24) {
await conn.sendMessage(id, { text: `「✎」 @${phone} cambió la descripción del grupo.`, mentions: [actor,...groupAdmins.map(v => v.id)] })
}
if (m.messageStubType == 25) {
await conn.sendMessage(id, { text: `「✎」 @${phone} cambió los ajustes del grupo para permitir que ${m.messageStubParameters[0] == 'on'? 'solo admins' : 'todos'} puedan configurar el grupo.`, mentions: [actor,...groupAdmins.map(v => v.id)] })
}
if (m.messageStubType == 26) {
await conn.sendMessage(id, { text: `「✎」 @${phone} cambió los ajustes del grupo para permitir que ${m.messageStubParameters[0] === 'on'? 'solo los administradores puedan enviar mensajes al grupo.' : 'todos los miembros puedan enviar mensajes al grupo.'}`, mentions: [actor,...groupAdmins.map(v => v.id)] })
}
})
  }
