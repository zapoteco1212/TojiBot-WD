import fs from 'fs'
import moment from 'moment-timezone'
import { getDevice } from '@whiskeysockets/baileys'

function normalize(text = '') {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').replace(/s$/, '')
}

function clockString(ms) {
let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
return [d && `${d}d`, `${h}h`, `${m}m`, `${s}s`].filter(Boolean).join(' ')
}

let handler = async (m, { conn, usedPrefix, args }) => {
try {
const botId = conn.user.jid
const botSettings = global.db.data.settings[botId] || {}
const botname = botSettings.namebot || 'TojiBot-WD'
const banner = botSettings.banner || './storage/img/menu.jpg'
const canalId = botSettings.id || global.ch?.id || ''
const canalName = botSettings.nameid || global.ch?.name || 'TojiBot-WD • Channel'

const tiempo = moment.tz('America/Caracas').format('DD MMM YYYY')
const tempo = moment.tz('America/Caracas').format('hh:mm A')
const users = Object.keys(global.db.data.users).length
const sender = global.db.data.users[m.sender]?.name || m.pushName || 'Usuario'
const device = getDevice(m.key.id)
const uptime = conn.uptime ? clockString(conn.uptime * 1000) : 'Desconocido'

const isPremiumBot = fs.existsSync(`./Sessions/Prems/${botId.split(':')[0]}`)
const isModBot = fs.existsSync(`./Sessions/Mods/${botId.split(':')[0]}`)
const botType = isPremiumBot ? 'Premium' : isModBot ? 'Mod' : 'Principal'

// Categorias
let tags = {}
for (let plugin of Object.values(global.plugins)) {
if (plugin.tags) for (let t of plugin.tags) tags[t] = t
}

let alias = {
anime: ['anime', 'reacciones'], downloads: ['downloads', 'descargas', 'dl'],
economia: ['economia', 'economy', 'eco'], gacha: ['gacha'], rpg: ['rpg'],
grupo: ['grupo', 'group'], nsfw: ['nsfw', '+18'], profile: ['profile', 'perfil'],
sockets: ['sockets', 'bots', 'jadibot'], stickers: ['stickers', 'sticker'],
utils: ['utils', 'utilidades', 'herramientas'], info: ['info']
}

let input = normalize(args[0] || '')
let cat = Object.keys(alias).find(k => alias[k].map(normalize).includes(input))

if (args[0] && !cat) {
return conn.reply(m.chat, `《✧》La categoria *${args[0]}* no existe\n> Disponibles: *${Object.keys(alias).join(', ')}*\n> Ejemplo: *${usedPrefix}menu anime*`, m)
}

// Header con tu decoración
let text = `
❀ *${botname}*
亗 *Tipo:* ${botType}
✎ *Usuario:* ${sender}
✿ *Device:* ${device}
✦ *Fecha:* ${tiempo}
✦ *Hora:* ${tempo}
✦ *Usuarios:* ${users.toLocaleString()}
✦ *Uptime:* ${uptime}

ꕥ *MENU ${cat ? `- ${cat.toUpperCase()}` : 'COMPLETO'}* ꕥ
`.trim() + '\n\n'

if (cat) {
text += `*╭─ ${cat.toUpperCase()} ─*\n`
for (let p of Object.values(global.plugins)) {
if (p.tags?.includes(cat) && p.help) {
for (let h of p.help) text += `│ • ${usedPrefix}${h}\n`
}
}
text += `╰──────────────`
} else {
for (let tag in tags) {
text += `*╭─ ${tag.toUpperCase()} ─*\n`
for (let p of Object.values(global.plugins)) {
if (p.tags?.includes(tag) && p.help) {
for (let h of p.help) text += `│ • ${usedPrefix}${h}\n`
}
}
text += `╰──────────────\n\n`
}
}

text += `\n> Usa *${usedPrefix}menu [categoria]* para filtrar`

let contextOptions = {
mentionedJid: [m.sender],
isForwarded: true,
forwardedNewsletterMessageInfo: { newsletterJid: canalId, newsletterName: canalName, serverMessageId: '' }
}

if (fs.existsSync(banner)) {
await conn.sendMessage(m.chat, { image: fs.readFileSync(banner), caption: text, contextInfo: contextOptions }, { quoted: m })
} else if (banner.startsWith('http')) {
let isVideo = banner.includes('.mp4')
if (isVideo) {
await conn.sendMessage(m.chat, { video: { url: banner }, gifPlayback: true, caption: text, contextInfo: contextOptions }, { quoted: m })
} else {
await conn.sendMessage(m.chat, { image: { url: banner }, caption: text, contextInfo: contextOptions }, { quoted: m })
}
} else {
await conn.sendMessage(m.chat, { text: text, contextInfo: contextOptions }, { quoted: m })
}

} catch (e) {
console.error(e)
await conn.reply(m.chat, `> Error: ${e.message}`, m)
}
}

handler.help = ['allmenu', 'help', 'menu']
handler.tags = ['info']
handler.command = /^(allmenu|help|menu)$/i
export default handler
