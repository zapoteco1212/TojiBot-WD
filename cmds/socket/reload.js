import { startSubBot } from '../lib/subs.js'
import fs from 'fs'
import path from 'path'
import { jidDecode } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
const idBot = conn.user.jid
if (!global.db.data.settings[idBot]) global.db.data.settings[idBot] = {}
const config = global.db.data.settings[idBot]

const isOwner2 = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)

if (!isOwner2 &&!m.isROwner &&!m.isOwner) {
return conn.reply(m.chat, mess.socket || '❌ Solo el socket puede usar este comando.', m)
}

const rawId = conn.user?.jid || conn.user?.id || ''
const decoded = jidDecode(rawId)
const cleanId = decoded?.user || rawId.split('@')[0].split(':')[0]

const sessionTypes = ['Subs', 'Mods', 'Prems']
const basePath = 'Sessions'
const sessionPath = sessionTypes.map((type) => path.join(basePath, type, cleanId)).find((p) => fs.existsSync(p))

if (!sessionPath) {
return conn.reply(m.chat, '《✧》 Este comando solo puede ser usado desde una instancia de Sub-Bot.', m)
}

const botId = conn.user.jid
const botSettings = global.db.data.settings[botId] || {}
const isOficialBot = botId === global.conn.user.jid
const botType = isOficialBot? 'Principal/Owner' : 'Sub Bot'
const caption = `✿ *Sesión del bot reiniciada correctamente!*.`
const phone = args[0]? args[0].replace(/\D/g, '') : m.sender.split('@')[0]
const chatId = m.chat

if (botType === 'Sub Bot') {
startSubBot(m, conn, caption, false, phone, chatId, {}, true)
}

await conn.reply(m.chat, caption, m)
}

handler.help = ['reload', 'reiniciar']
handler.tags = ['socket']
handler.command = /^(reload|reiniciar|restart)$/i
handler.owner = true
handler.rowner = true

export default handler
