import { randomBytes } from 'crypto'

function parseDuration(input) {
const regex = /^(\d+)(d|h|m)$/i
const match = input.match(regex)
if (!match) return null
const value = parseInt(match[1])
const unit = match[2].toLowerCase()

const multipliers = { d: 86400000, h: 3600000, m: 60000 }
return value * multipliers[unit]
}

let handler = async (m, { conn, args }) => {
if (!args[0]) {
return conn.reply(m.chat, `✎ Por favor indica la duración del token.\n> Ejemplo: */tokenmod 3d*`, m)
}

const duration = parseDuration(args[0])
if (!duration) {
return conn.reply(m.chat, `✎ Duración inválida.\nFormatos permitidos: *Nd*, *Nh*, *Nm* (días, horas, minutos)`, m)
}

const token = randomBytes(4).toString('hex')
const expires = Date.now() + duration

if (!global.db.data.tokensmod) global.db.data.tokensmod = {}

global.db.data.tokensmod[token] = {
uses: Infinity,
remaining: Infinity,
expires,
createdBy: m.sender,
}

const formattedDate = new Date(expires).toLocaleString('es-BO', {
timeZone: 'America/La_Paz',
dateStyle: 'medium',
timeStyle: 'short',
})

return conn.reply(m.chat,
`*✎ Token Mod Generado (❀)*\n\n` +
`✿ *Código:* ${token}\n` +
`✿ *Válido hasta:* ${formattedDate}`, m)
}

handler.help = ['tokenmod']
handler.tags = ['owner']
handler.command = /^(tokenmod)$/i
handler.owner = true
handler.rowner = true

export default handler
