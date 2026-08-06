import { startPremBot } from '../lib/prems.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commandFlags = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
const token = args[0]
if (!token) {
return conn.reply(m.chat, `《✧》 Por favor, ingresa tu token Premium.\n> Ejemplo: *${usedPrefix + command} tu_token*`, m)
}

if (!global.db.data.tokens) global.db.data.tokens = {}
const tokenData = global.db.data.tokens?.[token]

if (!tokenData) {
return conn.reply(m.chat, '❌ Token inválido o no existe en la base de datos.', m)
}

if (Date.now() > tokenData.expires) {
delete global.db.data.tokens[token]
return conn.reply(m.chat, '❌ El token ha expirado. Solicita uno nuevo.', m)
}

if (tokenData.uses >= tokenData.maxUses) {
delete global.db.data.tokens[token]
return conn.reply(m.chat, '❌ Este token ya ha alcanzado su límite máximo de usos.', m)
}

if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
let user = global.db.data.users[m.sender]
if (!user.Subs) user.Subs = 0

let time = (user.Subs || 0) + 120000
if (new Date() - user.Subs < 120000) {
return conn.reply(m.chat, `ꕥ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`, m)
}

const subsPath = path.join(__dirname, '../Sessions/Prems')
const subsCount = fs.existsSync(subsPath)
? fs.readdirSync(subsPath).filter((dir) => {
const credsPath = path.join(subsPath, dir, 'creds.json')
return fs.existsSync(credsPath)
}).length : 0

const maxSubs = 999
if (subsCount >= maxSubs) {
return conn.reply(m.chat, '✐ No se han encontrado espacios disponibles para registrar un `Prem-Bot`.', m)
}

tokenData.uses += 1

if (tokenData.uses >= tokenData.maxUses) {
delete global.db.data.tokens[token]
}

commandFlags[m.sender] = true

const rtx = '`✤` Vincula tu *cuenta Premium* usando el *código.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*'

const rtx2 = "`✤` Vincula tu *cuenta Premium* usando *código qr.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Escanea el código *QR.*"

const isCode = /^(code|codeprem)/.test(command)
const caption = isCode? rtx : rtx2

const phone = args[1]? args[1].replace(/\D/g, '') : m.sender.split('@')[0]

await startPremBot(m, conn, caption, isCode, phone, m.chat, commandFlags, true)
user.Subs = new Date() * 1
}

handler.help = ['codepremiun', 'qrpremiun', 'codeprem', 'qrprem']
handler.tags = ['socket']
handler.command = /^(codepremiun|qrpremiun|codeprem|qrprem)$/i

export default handler

function msToTime(duration) {
var seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60)
minutes = minutes > 0? minutes : ''
if (minutes) {
return `${minutes} minuto${minutes > 1? 's' : ''}, ${seconds} segundo${seconds > 1? 's' : ''}`
} else {
return `${seconds} segundo${seconds > 1? 's' : ''}`
}
}
