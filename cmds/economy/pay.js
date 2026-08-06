import { resolveLidToRealJid } from "../../lib/lid.js"

export const handler = {
command: ['pay', 'pagar', 'transferir'],
category: 'economia',
group: true,
botAdmin: false,
groupAdmin: false,
run: async (client, m, args, usedPrefix, command) => {
const db = global.db.data
const chatId = m.chat
const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
const botSettings = db.settings[botId] || {}
const monedas = botSettings.currency || 'TojiCoins'
const chatData = db.chats[chatId]

if (chatData.adminonly ||!chatData.economia) return m.reply(`⛩️ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *admin* puede activarlos con:\n» *${usedPrefix}economy on*`)

const mentioned = m.mentionedJid || []
const who2 = m.quoted? m.quoted.sender : mentioned[0] || (args[1]? (args[1].replace(/[@.+-]/g, '') + '@s.whatsapp.net') : '')

if (!who2) return m.reply(`╭─〔 💸 *PAY - Toji* 〕─\n│ ✦ Debes mencionar a quien transferir *${monedas}*\n│\n│ > Ejemplo:\n│ > *${usedPrefix + command} 25000 @user*\n│ > *${usedPrefix + command} all @user*\n╰───────────────────`)

const who = await resolveLidToRealJid(who2, client, m.chat)

if (who === m.sender) return m.reply(`✦ No puedes transferirte a ti mismo.`)

const senderData = chatData.users[m.sender]
const targetData = chatData.users[who]

if (!targetData) return m.reply(`✦ El usuario mencionado no está registrado en TojiBot.`)

const cantidadInput = args[0]?.toLowerCase()
let cantidad = cantidadInput === 'all'? senderData.bank : parseInt(cantidadInput)

if (!cantidadInput || isNaN(cantidad) || cantidad <= 0) {
return m.reply(`✦ Ingresa una cantidad válida de *${monedas}* para transferir.`)
}

if (typeof senderData.bank!== 'number') senderData.bank = 0
if (senderData.bank < cantidad) {
return m.reply(`✦ No tienes suficientes *${monedas}* en el banco.\n> Tu saldo: *¥${senderData.bank.toLocaleString()} ${monedas}*`)
}

senderData.bank -= cantidad
if (typeof targetData.bank!== 'number') targetData.bank = 0
targetData.bank += cantidad

if (isNaN(senderData.bank)) senderData.bank = 0

let name = global.db.data.users[who]?.name || who.split('@')[0]

await client.sendMessage(chatId, {
text: `╭─〔 ⛩️ *TRANSFER - TojiBot* 〕─
│ ✦ Transferiste *¥${cantidad.toLocaleString()} ${monedas}*
│ ✦ Para: *${name}*
│
│ ⚿ Tu banco: *¥${senderData.bank.toLocaleString()} ${monedas}*
╰───────────────────`,
mentions: [who]
}, { quoted: m })
}
}
