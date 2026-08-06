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

let handler = async (m, { conn, args, usedPrefix }) => {
if (!args[0]) {
return conn.reply(m.chat, `✎ Por favor indica la duración, usos por token y cantidad de tokens.\n> Ejemplo: *${usedPrefix}token 3d* (1 token, 1 uso)\n> Ejemplo: *${usedPrefix}token 3d 5* (1 token, 5 usos)\n> Ejemplo: *${usedPrefix}token 3d 5 4* (4 tokens, 5 usos cada uno)`, m)
}

const duration = parseDuration(args[0])
if (!duration) {
return conn.reply(m.chat, `✎ Duración inválida.\nFormatos permitidos: *Nd*, *Nh*, *Nm* (días, horas, minutos)`, m)
}

const maxUses = parseInt(args[1]) || 1
const tokenCount = parseInt(args[2]) || 1
const expires = Date.now() + duration

const username = m.pushName || (conn.getName? conn.getName(m.sender) : 'Owner')

if (!global.db.data.tokens) global.db.data.tokens = {}

const generatedTokens = []

for (let i = 0; i < tokenCount; i++) {
const token = randomBytes(4).toString('hex')

global.db.data.tokens[token] = {
uses: 0,
maxUses: maxUses,
expires,
createdBy: m.sender,
}

generatedTokens.push(token)
}

const formattedDate = new Date(expires).toLocaleString('es-BO', {
timeZone: 'America/La_Paz',
dateStyle: 'medium',
timeStyle: 'short',
})

const tokenListText = generatedTokens.map(tk => `✿ *Código:* ${tk}`).join('\n')

return conn.reply(m.chat,
`*✎ Tokens Premium (❀)*\n\n` +
`${tokenListText}\n` +
`✿ *Usos permitidos:* ${maxUses} cada token\n` +
`✿ *Válidos hasta:* ${formattedDate}\n\n\n` +
`Att: ${username}`, m)
}

handler.help = ['token', 'tokenprem']
handler.tags = ['owner']
handler.command = /^(token|tokenprem)$/i
handler.owner = true
handler.rowner = true

export default handler
