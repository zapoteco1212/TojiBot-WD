export const handler = {
command: ['economyboard', 'eboard', 'baltop', 'topcoins'],
category: 'economia',
run: async (client, m, args, usedPrefix, command) => {
const db = global.db.data
const chatId = m.chat
const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
const botSettings = db.settings[botId] || {}
const monedas = botSettings.currency || 'TojiCoins'
const chatData = db.chats[chatId]

if (chatData.adminonly ||!chatData.economia) return m.reply(`⛩️ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *admin* puede activarlos con:\n» *${usedPrefix}economy on*`)

try {
const users = Object.entries(chatData.users || {}).filter(([_, data]) => {
const total = (data.coins || 0) + (data.bank || 0)
return total >= 1000
}).map(([key, data]) => {
const name = db.users[key]?.name || data.name || 'Usuario'
return {...data, jid: key, name }
})

if (users.length === 0) return m.reply(`⛩️ No hay usuarios con más de 1,000 *${monedas}* en este grupo.`)

const sorted = users.sort((a, b) => (b.coins + b.bank) - (a.coins + a.bank))
const page = parseInt(args[0]) || 1
const pageSize = 10
const totalPages = Math.ceil(sorted.length / pageSize)

if (isNaN(page) || page < 1 || page > totalPages) return m.reply(`✦ La página *${page}* no existe. Hay *${totalPages}* páginas.`)

const start = (page - 1) * pageSize
const end = start + pageSize

let text = `╭─〔 🏆 *TOP ECONOMÍA - TojiBot* 〕─\n`
text += sorted.slice(start, end).map(({ name, coins, bank }, i) => {
const total = (coins || 0) + (bank || 0)
return `│ ${start + i + 1}. *${name}*\n│ └ Total » *¥${total.toLocaleString()} ${monedas}*`
}).join('\n')
text += `\n│\n│ ⌦ Página *${page}* de *${totalPages}*`
if (page < totalPages) text += `\n│ Siguiente » *${usedPrefix + command} ${page + 1}*`
text += `\n╰───────────────────`

await client.sendMessage(chatId, { text }, { quoted: m })

} catch (e) {
await m.reply(`⛩️ Error en *${usedPrefix + command}*: ${e.message}`)
}
}
                     }
