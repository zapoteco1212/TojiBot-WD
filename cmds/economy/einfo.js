export const handler = {
command: ['infoeconomy', 'cooldowns', 'economyinfo', 'einfo', 'cooldown'],
category: 'economia',
run: async (client, m, args, usedPrefix) => {
const db = global.db.data
const chatId = m.chat
const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
const chatData = db.chats[chatId]
const botSettings = db.settings[botId] || {}
const monedas = botSettings.currency || 'TojiCoins'

if (chatData.adminonly ||!chatData.economia) return m.reply(`⛩️ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *admin* puede activarlos con:\n» *${usedPrefix}economy on*`)

const user = chatData.users[m.sender]
const now = Date.now()
const oneDay = 24 * 60 * 60 * 1000

const cooldowns = {
work: Math.max(0, (user.lastwork || 0) - now),
crime: Math.max(0, (user.lastcrime || 0) - now),
mine: Math.max(0, (user.lastmine || 0) - now),
mat: Math.max(0, (user.lastmat || 0) - now),
cocinar: Math.max(0, (user.lastcocinar || 0) - now),
steal: Math.max(0, (user.laststeal || 0) - now),
daily: Math.max(0, (user.lastdaily || 0) + oneDay - now),
weekly: Math.max(0, (user.lastweekly || 0) + 7 * oneDay - now),
monthly: Math.max(0, (user.lastmonthly || 0) + 30 * oneDay - now),
cofre: Math.max(0, (chatData.lastCofre || 0) - now),
}

const formatTime = (ms) => {
if (ms <= 0) return 'Ahora.'
const totalSeconds = Math.floor(ms / 1000)
const days = Math.floor(totalSeconds / 86400)
const hours = Math.floor((totalSeconds % 86400) / 3600)
const minutes = Math.floor((totalSeconds % 3600) / 60)
const seconds = totalSeconds % 60
const parts = []
if (days > 0) parts.push(`${days}d`)
if (hours > 0) parts.push(`${hours}h`)
if (minutes > 0) parts.push(`${minutes}m`)
if (seconds > 0) parts.push(`${seconds}s`)
return parts.join(' ')
}

const coins = user.coins || 0
const name = db.users[m.sender]?.name || m.sender.split('@')[0]

const txt = `╭─〔 ⏳ *COOLDOWNS - TojiBot* 〕─
│ ✦ Usuario: *${name}*
│
│ ⛩️ Work » *${formatTime(cooldowns.work)}*
│ ⚔️ Crime » *${formatTime(cooldowns.crime)}*
│ ⛏️ Mine » *${formatTime(cooldowns.mine)}*
│ 🍳 Cocinar » *${formatTime(cooldowns.cocinar)}*
│ 🗡️ Mat » *${formatTime(cooldowns.mat)}*
│ 🥷 Steal » *${formatTime(cooldowns.steal)}*
│ 🎁 Daily » *${formatTime(cooldowns.daily)}*
│ 📦 Weekly » *${formatTime(cooldowns.weekly)}*
│ 🗓️ Monthly » *${formatTime(cooldowns.monthly)}*
│ 💎 Cofre » *${formatTime(cooldowns.cofre)}*
│
│ 💰 Total: *¥${coins.toLocaleString()} ${monedas}*
╰───────────────────`

await client.sendMessage(chatId, { text: txt }, { quoted: m })
}
                  }
