import { resolveLidToRealJid } from "../../lib/lid.js"

export const handler = {
command: ['balance', 'bal', 'coins', 'bank'],
category: 'economia',
botAdmin: false,
groupAdmin: false,
run: async (client, m, args, usedPrefix) => {
const db = global.db.data
const chatId = m.chat
const chatData = db.chats[chatId]

if (chatData.adminonly ||!chatData.economia) return m.reply(`⛩️ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *admin* puede activarlos con:\n» *${usedPrefix}economy on*`)

const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
const botSettings = db.settings[botId] || {}
const monedas = botSettings.currency || 'TojiCoins'

const mentioned = m.mentionedJid || []
const who2 = mentioned.length > 0? mentioned[0] : (m.quoted? m.quoted.sender : m.sender)
const who = await resolveLidToRealJid(who2, client, m.chat)

if (!(who in db.chats[m.chat].users)) {
return m.reply(`✦ El usuario no está registrado en TojiBot.`)
}

if (!(who in global.db.data.users)) {
global.db.data.users[who] = { name: await client.getName(who) || 'Usuario' }
}

const user = chatData.users[who]
const userName = global.db.data.users[who]?.name || 'Usuario'
const total = (user.coins || 0) + (user.bank || 0)

const bal = `╭─〔 💰 *BALANCE - TojiBot* 〕─
│ ✦ Usuario: *${userName}*
│
│ ⛀ Cartera: *¥${(user.coins || 0).toLocaleString()} ${monedas}*
│ ⚿ Banco: *¥${(user.bank || 0).toLocaleString()} ${monedas}*
│ ⛁ Total: *¥${total.toLocaleString()} ${monedas}*
│
│ > Protege tu dinero usando:
│ > *${usedPrefix}deposit*
╰───────────────────`

await client.sendMessage(chatId, { text: bal }, { quoted: m })
}
  }
