import { resolveLidToRealJid } from '../lib/utils.js'

let handler = async (m, { conn, args, usedPrefix }) => {
const db = global.db.data
const chatId = m.chat

if (!db.chats[chatId]) db.chats[chatId] = {}
const chatData = db.chats[chatId]

const mentioned = m.mentionedJid || []
const who2 = mentioned.length > 0? mentioned[0] : (m.quoted? m.quoted.sender : m.sender)
const who = await resolveLidToRealJid(who2, conn, m.chat)

if (!chatData.users?.[who]) {
return conn.reply(m.chat, `「✎」 El usuario mencionado no está registrado en el bot.`, m)
}

const userStats = chatData.users[who].stats || {}
const now = new Date()
const daysArg = parseInt(args[0]) || 30
const cutoff = new Date(now.getTime() - daysArg * 24 * 60 * 60 * 1000)

const days = Object.entries(userStats)
.filter(([date]) => new Date(date) >= cutoff)
.sort((a, b) => new Date(b[0]) - new Date(a[0]))

const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)

let report = `❀ Contador de mensajes de @${who.split('@')[0]}\n`
report += `> Total en los últimos *${daysArg}* días: \`${totalMsgs}\` mensajes\n\n`

for (const [date, d] of days) {
const fecha = new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })
report += `*❏ ${fecha}*\n`
report += `\t» Mensajes: \`${d.msgs || 0}\`, Comandos: \`${d.cmds || 0}\`\n`
}

await conn.reply(chatId, report, m, { mentions: [who] })
}

handler.help = ['count', 'mensajes', 'msgcount']
handler.tags = ['grupo']
handler.command = /^(count|mensajes|messages|msgcount)$/i
handler.group = true

export default handler
