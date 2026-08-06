import { resolveLidToRealJid } from "../lib/utils.js"

let handler = async (m, { conn, args, usedPrefix, command }) => {
const idBot = conn.user.jid
if (!global.db.data.settings[idBot]) global.db.data.settings[idBot] = {}
const config = global.db.data.settings[idBot]

const isOwner2 = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)

if (!isOwner2 &&!m.isROwner &&!m.isOwner) {
return conn.reply(m.chat, mess.socket || '❌ Solo el socket puede usar este comando.', m)
}

const text = args.join(' ').trim()
const actual = config.owner || ''

if (text.toLowerCase() === 'clear') {
if (!actual) return conn.reply(m.chat, `❀ No hay ningún propietario asignado actualmente.`, m)
config.owner = ''
return conn.reply(m.chat, `❀ Se ha eliminado el propietario del Socket.`, m)
}

const mentionedJid = m.mentionedJid || []
const who2 = mentionedJid.length > 0? mentionedJid[0] : (m.quoted? m.quoted.sender : null)
const who = who2? await resolveLidToRealJid(who2, conn, m.chat) : null
const limpio = text.replace(/[^0-9]/g, '')
const nuevo = who || (limpio.length >= 10? (limpio.startsWith('52') && limpio.length === 12? `52${limpio[2]!== '1'? '1' : ''}${limpio.slice(2)}@s.whatsapp.net` : `${limpio}@s.whatsapp.net`) : null)

if (actual && ((!m.quoted && mentionedJid.length === 0 &&!text) || (nuevo && actual === nuevo))) {
return conn.sendMessage(m.chat, { text: `ꕥ Ya tienes un dueño asignado @${actual.split('@')[0]}.\n\n✿ Si quieres cambiarlo usa:\n> *${usedPrefix + command}* @${idBot.split('@')[0]}\n\n✿ Si quieres eliminar el dueño asignado usa:\n> *${usedPrefix + command} clear*`, mentions: [actual, idBot] }, { quoted: m })
}

if (!nuevo) return conn.reply(m.chat, `✐ Debes mencionar al nuevo dueño del Socket.\n> Ejemplo: *${usedPrefix + command}* @${idBot.split('@')[0]}`, m, { mentions: [idBot] })

const [ownerActual, ownerNuevo] = [actual? actual.split('@')[0] : null, nuevo.split('@')[0]]
config.owner = nuevo

return conn.sendMessage(m.chat, { text: actual && actual!== nuevo? `✿ El dueño del sokect ha sido cambiado de @${ownerActual} a @${ownerNuevo}!` : `❀ Se asignó a @${ownerNuevo} como nuevo propietario de *${config.namebot}*!`, mentions: [nuevo,...(actual && actual!== nuevo? [actual] : [])] }, { quoted: m })
}

handler.help = ['setbotowner', 'setowner']
handler.tags = ['socket']
handler.command = /^(setbotowner|setowner)$/i
handler.owner = true
handler.rowner = true

export default handler
