import fs from 'fs'
import path from 'path'
import { jidDecode } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
const rawId = conn.user?.jid || conn.user?.id || ''
const decoded = jidDecode(rawId)
const cleanId = decoded?.user || rawId.split('@')[0].split(':')[0]

const sessionTypes = ['Subs', 'Mods', 'Prems', 'Sockets'] // todas las carpetas donde Toji guarda subs
const basePath = 'Sessions'
const sessionPath = sessionTypes.map((type) => path.join(basePath, type, cleanId)).find((p) => fs.existsSync(p))

if (!sessionPath) {
// si no está en Subs, intenta buscar directo por el jid completo
const fallback = path.join(basePath, 'Subs', cleanId)
if (!fs.existsSync(fallback)) {
return conn.reply(m.chat, '《✧》 Este comando solo puede ser usado desde una instancia de Sub-Bot.', m)
}
}

try {
await conn.reply(m.chat, '《✧》 Cerrando sesión del Socket...', m)
await conn.logout()

setTimeout(() => {
const finalPath = sessionPath || path.join(basePath, 'Subs', cleanId)
if (fs.existsSync(finalPath)) {
fs.rmSync(finalPath, { recursive: true, force: true })
console.log(`《✧》 Sesión de ${cleanId} eliminada de ${finalPath}`)
}
}, 2000)

setTimeout(() => {
conn.reply(m.chat, `《✧》 Sesión finalizada correctamente.\nPuedes reconectarte usando *${usedPrefix}code*`, m)
}, 3000)

} catch (e) {
await conn.reply(m.chat, `> Ocurrió un error inesperado al ejecutar *${usedPrefix + command}*.\n> [Error: *${e.message}*]`, m)
}
}

handler.help = ['logout']
handler.tags = ['socket']
handler.command = /^(logout)$/i
handler.owner = false // debe poder usarlo el sub-bot, no solo el owner principal

export default handler
