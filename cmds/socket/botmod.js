import { startModBot } from '../lib/mods.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commandFlags = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
// 🔥 1. VALIDACIÓN DEL TOKEN MOD
const token = args[0]
if (!token) {
return conn.reply(m.chat, `《✧》 Por favor, ingresa tu token de Moderador.\n> Ejemplo: *${usedPrefix + command} tu_token*`, m)
}

if (!global.db.data.tokensmod) global.db.data.tokensmod = {}
const tokenData = global.db.data.tokensmod?.[token]

if (!tokenData) {
return conn.reply(m.chat, '❌ Token Mod inválido o no existe en la base de datos.', m)
}
if (Date.now() > tokenData.expires) {
delete global.db.data.tokensmod[token]
return conn.reply(m.chat, '❌ El token Mod ha expirado. Solicita uno nuevo.', m)
}

// 2. VERIFICACIÓN DE TIEMPO (COOLDOWN)
if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
if (!global.db.data.users[m.sender].Subs) global.db.data.users[m.sender].Subs = 0

let time = global.db.data.users[m.sender].Subs + 120000 || ''
if (new Date() - global.db.data.users[m.sender].Subs < 120000) {
return conn.reply(m.chat, `ꕥ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`, m)
}

// 3. LÍMITE DE SESIONES
const subsPath = path.join(__dirname, '../Sessions/Mods')
const subsCount = fs.existsSync(subsPath)
? fs.readdirSync(subsPath).filter((dir) => {
const credsPath = path.join(subsPath, dir, 'creds.json')
return fs.existsSync(credsPath)
}).length : 0

const maxSubs = 50
if (subsCount >= maxSubs) {
return conn.reply(m.chat, '✐ No se han encontrado espacios disponibles para registrar un `Mod-Bot`.', m)
}

// 4. EJECUCIÓN
commandFlags[m.sender] = true

const rtx = '`✤` Vincula tu *cuenta Mod* usando el *código.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\nꕤ *`Importante`*\n> ₊·( 🜸 ) ➭ Este *Código* solo funciona en el *número que lo solicito*'

const rtx2 = "`✤` Vincula tu *cuenta Mod* usando *código qr.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Escanea el código *QR.*\n\n> ₊·( 🜸 ) ➭ Recuerda que no es recomendable usar tu cuenta principal para registrar un socket."

const isCode = /^(code)/.test(command)
const isCommand = true
const caption = isCode? rtx : rtx2

// Si args[1] existe, usa ese número, si no, usa el número del remitente
const phone = args[1]? args[1].replace(/\D/g, '') : m.sender.split('@')[0]

await startModBot(m, conn, caption, isCode, phone, m.chat, commandFlags, isCommand)
global.db.data.users[m.sender].Subs = new Date() * 1
}

handler.help = ['codemod', 'qrmod']
handler.tags = ['socket']
handler.command = /^(codemod|qrmod)$/i

export default handler

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = hours < 10? '0' + hours : hours
minutes = minutes > 0? minutes : ''
seconds = seconds < 10 && minutes > 0? '0' + seconds : seconds
if (minutes) {
return `${minutes} minuto${minutes > 1? 's' : ''}, ${seconds} segundo${seconds > 1? 's' : ''}`
} else {
return `${seconds} segundo${seconds > 1? 's' : ''}`
}
  }
