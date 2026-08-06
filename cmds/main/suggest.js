const msToTime = (duration) => {
let seconds = Math.floor((duration / 1000) % 60)
let minutes = Math.floor((duration / (1000 * 60)) % 60)
let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
let days = Math.floor(duration / (1000 * 60 * 60 * 24))
let s = seconds.toString().padStart(2, '0')
let m = minutes.toString().padStart(2, '0')
let h = hours.toString().padStart(2, '0')
let d = days.toString()
let parts = []
if (days > 0) parts.push(`${d} día${d > 1? 's' : ''}`)
if (hours > 0) parts.push(`${h} hora${h > 1? 's' : ''}`)
if (minutes > 0) parts.push(`${m} minuto${m > 1? 's' : ''}`)
parts.push(`${s} segundo${s > 1? 's' : ''}`)
return parts.join(', ')
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
// pon tus numeros aqui, ej: ['5939xxxxxx']
const bypassCooldown = []

let texto = (text || args.join(' ')).trim()
let now = Date.now()

if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
let userData = global.db.data.users[m.sender]
let cooldown = userData.sugCooldown || 0
let restante = cooldown - now

let senderNum = m.sender.split('@')[0]
let isOwner = global.owner.map(v => v[0] + '@s.whatsapp.net').includes(m.sender) || bypassCooldown.includes(senderNum)

if (restante > 0 &&!isOwner) {
return conn.reply(m.chat, `ꕥ Espera *${msToTime(restante)}* para volver a usar este comando.`, m)
}
if (!texto) {
return conn.reply(m.chat, `《✧》 Debes *escribir* el *reporte* o *sugerencia*.\n> Ejemplo: *${usedPrefix + command} El comando play no funciona*`, m)
}
if (texto.length < 10) {
return conn.reply(m.chat, '《✧》 Tu mensaje es *demasiado corto*. Explica mejor (mínimo 10 caracteres)', m)
}

let fechaLocal = new Date().toLocaleDateString('es-MX', {
weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

let esReporte = ['report', 'reporte'].includes(command)
let tipo = esReporte? '🆁ҽ𝕡σɾƚҽ' : '🆂մց𝕖ɾҽ𝚗cíᥲ'
let user = m.pushName || 'Usuario desconocido'
let numero = m.sender.split('@')[0]
let isGroup = m.chat.endsWith('@g.us')
let origen = isGroup? m.chat : 'Privado'

let reportMsg = `𫡗۫᷒ᰰ⃘ׅ᷒ ۟　\`${tipo}\`　ׅ　ᩡ

𖹭 ׄ ְ ❖ *Nombre*
> ${user}

𖹭 ׄ ְ ❖ *Número*
> wa.me/${numero}

𖹭 ׄ ְ ❖ *Origen*
> ${origen}

𖹭 ׄ ְ ❖ *Fecha*
> ${fechaLocal}

𖹭 ׄ ְ ❖ *Mensaje*
> ${texto}
`

for (let [jid] of global.owner.map(v => [v[0] + '@s.whatsapp.net'])) {
try {
await conn.sendMessage(jid, { text: reportMsg })
} catch {}
}

const staffGroup = '120363408958387351@g.us'
try {
await conn.sendMessage(staffGroup, { text: reportMsg })
} catch {}

if (!isOwner) {
userData.sugCooldown = now + 10 * 60000
}

await conn.reply(m.chat, `《✧》 Gracias por tu *${esReporte? 'reporte' : 'sugerencia'}*\n\n> Tu mensaje fue enviado correctamente a los moderadores`, m)
}

handler.help = ['report', 'reporte', 'sug', 'suggest']
handler.tags = ['info']
handler.command = /^(report|reporte|sug|suggest)$/i

export default handler
