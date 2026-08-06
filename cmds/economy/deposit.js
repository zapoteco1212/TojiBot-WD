export const handler = {
command: ['dep', 'deposit', 'd', 'depositar'],
category: 'economia',
botAdmin: false,
groupAdmin: false,
run: async (client, m, args, usedPrefix) => {
const chatData = global.db.data.chats[m.chat]
const user = chatData.users[m.sender]
const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
const settings = global.db.data.settings[idBot] || {}
const monedas = settings.currency || 'TojiCoins'

if (chatData.adminonly ||!chatData.economia) return m.reply(`⛩️ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *admin* puede activarlos con:\n» *${usedPrefix}economy on*`)

if (!args[0]) {
return m.reply(`╭─〔 💰 *DEPOSIT - Toji* 〕─\n│ ✦ Ingresa la cantidad de *${monedas}*\n│ que quieras depositar.\n│\n│ > Ejemplo: *${usedPrefix}dep 100*\n│ > Todo: *${usedPrefix}dep all*\n╰───────────────────`)
}

if (args[0].toLowerCase() === 'all') {
if (user.coins <= 0) return m.reply(`✦ No tienes *${monedas}* para depositar en tu banco.`)
const count = user.coins
user.coins = 0
user.bank = (user.bank || 0) + count
return await m.reply(`⛩️ Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco.`)
}

if (!Number(args[0]) || parseInt(args[0]) < 1) {
return m.reply(`✦ Ingresa una cantidad válida para depositar.`)
}

const count = parseInt(args[0])

if (user.coins <= 0 || user.coins < count) {
return m.reply(`✦ No tienes suficientes *${monedas}* para depositar.\nTienes: *¥${(user.coins || 0).toLocaleString()}*`)
}

user.coins -= count
user.bank = (user.bank || 0) + count

await m.reply(`╭─〔 ⛩️ *BANCO - TojiBot* 〕─\n│ ✦ Has depositado *¥${count.toLocaleString()} ${monedas}*\n│ ⚿ Banco actual: *¥${user.bank.toLocaleString()}*\n╰───────────────────`)
}
  }
