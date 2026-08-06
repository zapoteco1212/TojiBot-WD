import fs from 'fs'
import moment from 'moment-timezone'
import { getDevice } from '@whiskeysockets/baileys'

function normalize(text = '') {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').replace(/s$/, '')
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
try {
const botId = conn.user.jid
const botIdNumber = botId.split(':')[0]
const botSettings = global.db.data.settings[botId] || {}
const botname = botSettings.botname || global.db.data.settings[botId]?.namebot || 'TojiBot-WD'
const namebot = botSettings.namebot || botname
const banner = botSettings.banner || './storage/img/menu.jpg'
const owner = botSettings.owner || global.owner[0][0]
const canalId = botSettings.id || global.ch?.id || ''
const canalName = botSettings.nameid || global.ch?.name || 'TojiBot Channel'
const link = botSettings.link || 'https://whatsapp.com'

const tiempo = moment.tz('America/Caracas').format('DD MMM YYYY')
const tempo = moment.tz('America/Caracas').format('hh:mm A')

// Tipo de bot (lógica Toji)
const isPremiumBot = fs.existsSync(`./Sessions/Prems/${botIdNumber}`)
const isModBot = fs.existsSync(`./Sessions/Mods/${botIdNumber}`)
const isOficialBot = botId === (global.conn?.user?.jid || conn.user.jid)
const botType = isOficialBot? 'Principal' : isPremiumBot? 'Premium' : isModBot? 'Mod' : 'SubBot'

const users = Object.keys(global.db.data.users).length
const device = getDevice(m.key.id)
const sender = global.db.data.users[m.sender]?.name || m.pushName || 'Usuario'
let uptime = conn.uptime? clockString(conn.uptime * 1000) : 'Desconocido'

let tags = {}
let commands = {}
for (let plugin of Object.values(global.plugins)) {
if (!plugin.help ||!plugin.tags) continue
for (let tag of plugin.tags) {
if (!tags[tag]) tags[tag] = tag
for (let help of plugin.help) {
commands[help] = tag
}
}
}

let alias = {
anime: ['anime', 'reacciones'],
downloads: ['downloads', 'descargas', 'dl'],
economia: ['economia', 'economy', 'eco'],
gacha: ['gacha'],
rpg: ['rpg'],
grupo: ['grupo', 'group'],
nsfw: ['nsfw', '+18'],
profile: ['profile', 'perfil'],
sockets: ['sockets', 'bots', 'jadibot'],
stickers: ['stickers', 'sticker'],
utils: ['utils', 'utilidades', 'herramientas'],
info: ['info', 'informacion']
}

let input = normalize(args[0] || '')
let cat = Object.keys(alias).find(k => alias[k].map(normalize).includes(input))

if (args[0] &&!cat) {
return conn.reply(m.chat, `《✧》 La categoria *${args[0]}* no existe.\nCategorias: *${Object.keys(alias).join(', ')}*\n> Usa *${usedPrefix}menu*\n> Ejemplo: *${usedPrefix}menu anime*`, m)
}

let header = `
╭─ *${namebot}* ─
│ ✦ *Owner:* ${owner}
│ ✦ *Tipo:* ${botType}
│ ✦ *Device:* ${device}
│ ✦ *Fecha:* ${tiempo}
│ ✦ *Hora:* ${tempo}
│ ✦ *Usuarios:* ${users}
│ ✦ *Uptime:* ${uptime}
│ ✦ *Usuario:* ${sender}
╰───────────────
`.trim()

let body = ''
if (cat) {
body += `\n\n*— ${cat.toUpperCase()} —*\n`
for (let help of Object.keys(commands)) {
if (commands[help] == cat) body += `» ${usedPrefix}${help}\n`
}
} else {
for (let tag in tags) {
body += `\n*╭─ ${tag.toUpperCase()} ─*\n`
for (let help in commands) {
if (commands[help] == tag) body += `│ » ${usedPrefix}${help}\n`
}
body += `╰──────────────\n`
}
}

let menu = `${header}\n${body}\n> ${link}`.trim()

let contextOptions = {
mentionedJid: [m.sender],
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: canalId,
serverMessageId: '',
newsletterName: canalName
}
}

let isVideo = typeof banner == 'string' && (banner.includes('.mp4') || banner.includes('.webm'))

if (fs.existsSync(banner) || banner.startsWith('http')) {
if (isVideo) {
await conn.sendMessage(m.chat, { video: fs.existsSync(banner)? fs.readFileSync(banner) : { url: banner }, gifPlayback: true, caption: menu, contextInfo: contextOptions }, { quoted: m })
} else {
await conn.sendMessage(m.chat, { image: fs.existsSync(banner)? fs.readFileSync(banner) : { url: banner }, caption: menu, contextInfo: contextOptions }, { quoted: m })
}
} else {
await conn.sendMessage(m.chat, { text: menu, contextInfo: contextOptions }, { quoted: m })
}

} catch (e) {
console.log(e)
await conn.reply(m.chat, `Error en menu: ${e.message}`, m)
}
}

handler.help = ['allmenu', 'help', 'menu']
handler.tags = ['info']
handler.command = /^(allmenu|help|menu)$/i

export default handler

function clockString(ms) {
let d = isNaN(ms)? '--' : Math.floor(ms / 86400000)
let h = isNaN(ms)? '--' : Math.floor(ms / 3600000) % 24
let m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60
return [d && `${d}d`, `${h}h`, `${m}m`, `${s}s`].filter(Boolean).join(' ')
  }
