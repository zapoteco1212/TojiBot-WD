import { Browsers, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
let numero = args[0]

if (!numero) {
return conn.reply(m.chat, `《✧》 Ingresa el número que será el nuevo Bot Principal.\n> Ejemplo: *${usedPrefix + command} 5219999999999*`, m)
}

let cleanNumber = numero.replace(/\D/g, '')
await conn.reply(m.chat, `⏳ *INICIANDO PROTOCOLO DE RESCATE...*\nGenerando código de vinculación para *+${cleanNumber}*.\n\n> ⚠️ *ADVERTENCIA:* La sesión del bot principal actual será eliminada para dar espacio a este nuevo número.`, m)

const ownerSessionPath = path.resolve('./Sessions/Owner')

try {
if (fs.existsSync(ownerSessionPath)) {
fs.rmSync(ownerSessionPath, { recursive: true, force: true })
}
fs.mkdirSync(ownerSessionPath, { recursive: true })
} catch (e) {
return conn.reply(m.chat, '❌ Error al limpiar la carpeta del Owner anterior.', m)
}

try {
const { state, saveCreds } = await useMultiFileAuthState(ownerSessionPath)
const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
logger: pino({ level: 'silent' }),
printQRInTerminal: false,
browser: Browsers.macOS('Chrome'),
auth: state,
markOnlineOnConnect: true,
generateHighQualityLinkPreview: false,
syncFullHistory: false,
getMessage: async () => "",
version
})

sock.ev.on('creds.update', saveCreds)

setTimeout(async () => {
try {
if (!sock.authState.creds.registered) {
let codeGen = await sock.requestPairingCode(cleanNumber)
codeGen = codeGen?.match(/.{1,4}/g)?.join("-") || codeGen

await conn.reply(m.chat, `「✿」 *CÓDIGO DE NUEVO PRINCIPAL* 「✿」\n\n> ➭ *Número:* +${cleanNumber}\n> ➭ *Código:* *${codeGen}*\n\n_Ingresa este código en Dispositivos Vinculados de tu nuevo WhatsApp._\n\n_El sistema te avisará aquí cuando se conecte._`, m)
}
} catch (err) {
console.error("[Código Error]", err)
conn.reply(m.chat, `❌ Error al solicitar el código: ${err.message}`, m)
}
}, 3000)

sock.ev.on('connection.update', async (update) => {
const { connection } = update
if (connection === 'open') {
await conn.reply(m.chat, `✅ *¡CONEXIÓN EXITOSA!*\n\nEl número +${cleanNumber} ahora es el nuevo Bot Principal.\n\n🔄 *Reiniciando el servidor en 5 segundos...*`, m)
setTimeout(() => {
process.exit(1)
}, 5000)
}
})

} catch (error) {
console.error(error)
await conn.reply(m.chat, `> ❌ Error inesperado durante el rescate.\n> [Error: *${error.message}*]`, m)
}
}

handler.help = ['newowner', 'setnewowner', 'botprincipal', 'rescueowner']
handler.tags = ['owner']
handler.command = /^(newowner|setnewowner|botprincipal|rescueowner)$/i
handler.owner = true
handler.rowner = true

export default handler
