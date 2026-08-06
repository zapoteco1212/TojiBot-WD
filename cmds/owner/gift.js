function parseDuration(input) {
const regex = /^(\d+)(d|h|m)$/i
const match = input.match(regex)
if (!match) return null
const value = parseInt(match[1])
const unit = match[2].toLowerCase()
const multipliers = {
d: 86400000,
h: 3600000,
m: 60000
}
return value * multipliers[unit]
}

let handler = async (m, { conn, args, usedPrefix }) => {
global.db.data.gifts ||= {}

if (!args[0] ||!args[1] ||!args[2] ||!args[3]) {
return conn.reply(m.chat,
`✎ Uso correcto:

> ${usedPrefix}gift 5000 10000 5 1d
> ${usedPrefix}gift 25000 50000 1 12h

Formato:
> XP COINS USOS TIEMPO`, m)
}

let xp = Number(args[0])
let coins = Number(args[1])
let uses = Number(args[2])
let duration = parseDuration(args[3])

if (isNaN(xp) || isNaN(coins) || isNaN(uses)) {
return conn.reply(m.chat, '✎ Debes ingresar cantidades y usos válidos (solo números).', m)
}

if (xp < 0 || coins < 0 || uses <= 0) {
return conn.reply(m.chat, '✎ Las cantidades y los usos no pueden ser negativos o cero.', m)
}

if (!duration) {
return conn.reply(m.chat,
`✎ Tiempo inválido.

> 1d = 1 día
> 12h = 12 horas
> 30m = 30 minutos`, m)
}

let code
do {
code = Math.floor(10000000 + Math.random() * 90000000).toString()
} while (global.db.data.gifts[code])

let expires = Date.now() + duration

global.db.data.gifts[code] = {
xp,
coins,
uses,
claimedBy: [],
expires,
createdBy: m.sender,
createdAt: Date.now()
}

let fecha = new Date(expires).toLocaleString('es-BO', {
timeZone: 'America/La_Paz',
dateStyle: 'medium',
timeStyle: 'short'
})

return conn.reply(m.chat,
`╭─〔 RECOMPENSA GENERADA 〕─⬣

✦ Código
> ${code}

✦ XP
> ${xp.toLocaleString()}

✦ Coins
> ${coins.toLocaleString()}

✦ Usos permitidos
> ${uses}

✦ Expira
> ${fecha}

✦ Reclamar con
> ${usedPrefix}reward ${code}

╰────────────⬣`, m)
}

handler.help = ['gift']
handler.tags = ['owner']
handler.command = /^gift$/i
handler.owner = true
handler.rowner = false

export default handler
