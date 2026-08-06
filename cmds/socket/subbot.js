import { startSubBot } from '../lib/subs.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commandFlags = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
if (!global.db.data.users[m.sender].Subs) global.db.data.users[m.sender].Subs = 0

let time = global.db.data.users[m.sender].Subs + 120000 || ''
if (new Date() - global.db.data.users[m.sender].Subs < 120000) {
return conn.reply(m.chat, `ꕥ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`, m)
}

const subsPath = path.join(__dirname, '../Sessions/Subs')
const subsCount = fs.existsSync(subsPath)
? fs.readdirSync(subsPath).filter((dir) => {
const credsPath = path.join(subsPath, dir, 'creds.json')
return fs.existsSync(credsPath)
}).length : 0

const maxSubs = 999 // 0 = bloqueado, pon 999 para ilimitado como Toji
if (subsCount >= maxSubs) {
return conn.reply(m.chat, '✐ No se han encontrado espacios disponibles para registrar un `Sub-Bot`.', m)
}

commandFlags[m.sender] = true

const rtx = '`✤` Vincula tu *cuenta* usando el *codigo.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\nꕤ *`Importante`*\n> ₊·( 🜸 ) ➭ Este *Código* solo funciona en el *número que lo solicito*'

const rtx2 = "`✤` Vincula tu *cuenta* usando *codigo qr.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Escanea el código *QR.*\n\n> ₊·( 🜸 ) ➭ Recuerda que no es recomendable usar tu cuenta principal para registrar un socket."

const isCode = /^(code)$/.test(command)
const isCommands = /^(code|qr)$/.test(command)
const isCommand = isCommands? true : false
const caption = isCode? rtx : rtx2
const phone = args[0]? args[0].replace(/\D/g, '') : m.sender.split('@')[0]

await startSubBot(m, conn, caption, isCode, phone, m.chat, commandFlags, isCommand)
global.db.data.users[m.sender].Subs = new Date() * 1
}

handler.help = ['code', 'qr']
handler.tags = ['socket']
handler.command = /^(code|qr)$/i

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
