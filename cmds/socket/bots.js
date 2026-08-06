import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
try {
const botIdNumber = (conn?.user?.jid || '').split(':')[0].replace(/\D/g, '')
const botId = conn.user.jid

const botSettings = global.db.data.settings[botId] || {}
const banner = botSettings.icon || botSettings.banner || ''
const canalId = botSettings.id || ''
const canalName = botSettings.nameid || ''

const from = m.chat
const groupMetadata = m.isGroup? await conn.groupMetadata(from).catch(() => null) : null
const groupParticipants = groupMetadata?.participants?.map((p) => p.id || p.jid || '') || []

const mainBotIdNumber = (global.conn?.user?.jid || conn?.user?.jid || '').split(':')[0].replace(/\D/g, '')
const mainBotJid = mainBotIdNumber? `${mainBotIdNumber}@s.whatsapp.net` : ''
const isMainBotInGroup = mainBotJid? groupParticipants.includes(mainBotJid) : false

const basePath = path.resolve('./Sessions')

const MAX_LIMITS = {
Sub: 0,
Premium: 0
}

const getBotsFromFolder = (folderName) => {
const folderPath = path.join(basePath, folderName)
if (!fs.existsSync(folderPath)) return []
return fs.readdirSync(folderPath).filter((dir) => {
const credsPath = path.join(folderPath, dir, 'creds.json')
return fs.existsSync(credsPath)
}).map((id) => id.replace(/\D/g, ''))
}

const subs = getBotsFromFolder('Subs')
const mods = getBotsFromFolder('Mods')
const prems = getBotsFromFolder('Prems')

const categorizedBots = { Owner: [], Mod: [], Premium: [], Sub: [] }
const mentionedJid = []

const formatBot = (number, label) => {
const jid = number + '@s.whatsapp.net'
if (!groupParticipants.includes(jid)) return null
mentionedJid.push(jid)
const data = global.db.data.settings[jid] || {}
const name = data.namebot || 'Bot'
const handle = `@${number}`
return `- [${label} *${name}*] › ${handle}`
}

if (mainBotJid && global.db.data.settings[mainBotJid]) {
const name = global.db.data.settings[mainBotJid].namebot || 'Owner'
if (isMainBotInGroup) {
mentionedJid.push(mainBotJid)
categorizedBots.Owner.push(`- [Owner *${name}*] › @${mainBotIdNumber}`)
}
}

mods.forEach((num) => {
const line = formatBot(num, 'Mod')
if (line) categorizedBots.Mod.push(line)
})

prems.forEach((num) => {
const line = formatBot(num, 'Premium')
if (line) categorizedBots.Premium.push(line)
})

subs.forEach((num) => {
const line = formatBot(num, 'Sub')
if (line) categorizedBots.Sub.push(line)
})

const totalCounts = {
Owner: (mainBotJid && global.db.data.settings[mainBotJid])? 1 : 0,
Mod: mods.length,
Premium: prems.length,
Sub: subs.length,
}

const totalBots = totalCounts.Owner + totalCounts.Mod + totalCounts.Premium + totalCounts.Sub
const totalInGroup = categorizedBots.Owner.length + categorizedBots.Mod.length + categorizedBots.Premium.length + categorizedBots.Sub.length

let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`
message += `❖ Principales › *${totalCounts.Owner + totalCounts.Mod}*\n`
message += `✰ Premiums › *${totalCounts.Premium} / ${MAX_LIMITS.Premium}*\n`
message += `✿ Subs › *${totalCounts.Sub} / ${MAX_LIMITS.Sub}*\n\n`
message += `➭ *Bots en el grupo ›* ${totalInGroup}\n\n`

for (const category of ['Owner', 'Mod', 'Premium', 'Sub']) {
if (categorizedBots[category].length) {
message += categorizedBots[category].join('\n') + '\n'
}
}

const contextOptions = {
mentionedJid: [m.sender,...mentionedJid],
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: canalId,
serverMessageId: '',
newsletterName: canalName
}
}

if (banner) {
const mediaMsg = await conn.sendMessage(m.chat, { image: { url: banner } }, { quoted: m })
await conn.sendMessage(m.chat, {
text: message.trim(),
contextInfo: contextOptions
}, { quoted: mediaMsg })
} else {
await conn.sendMessage(m.chat, {
text: message.trim(),
contextInfo: contextOptions
}, { quoted: m })
}

} catch (e) {
console.error(e)
await conn.reply(m.chat, `> ❌ Error inesperado.\n> [Error: *${e.message}*]`, m)
}
}

handler.help = ['bots', 'sockets']
handler.tags = ['socket']
handler.command = /^(bots|sockets)$/i
handler.admin = true
handler.group = true

export default handler
