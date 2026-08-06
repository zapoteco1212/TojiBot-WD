let handler = async (m, { conn }) => {
try {
if (!global.db.data.chats[m.chat] ||!global.db.data.chats[m.chat].users) {
return conn.reply(m.chat, `《✧》 No hay datos de economía registrados en este grupo.`, m)
}

let users = global.db.data.chats[m.chat].users
let userList = Object.keys(users)

if (userList.length === 0) {
return conn.reply(m.chat, `《✧》 No hay usuarios para resetear.`, m)
}

await m.react('🕒')

userList.forEach(jid => {
if (users[jid]) {
users[jid].coins = 0
users[jid].bank = 0
}
})

await m.react('✔️')

let botId = conn.user.jid
let currency = global.db.data.settings?.[botId]?.currency || 'Coins'

let txt = `《✧》 *ECONOMÍA REINICIADA* 《✧》\n\n`
txt += `> ❀ Se han restablecido los valores de todos los usuarios en este grupo.\n`
txt += `> ❀ *Total de cuentas:* ${userList.length}\n`
txt += `> ❀ *Saldo actual:* 0 ${currency}\n\n`
txt += `_La base de datos del grupo ha sido limpiada con éxito._`

return conn.reply(m.chat, txt, m)

} catch (error) {
console.error(error)
await m.react('✖️')
return conn.reply(m.chat, `⚠︎ Error al intentar resetear la economía:\n${error.message}`, m)
}
}

handler.help = ['resetallcoins']
handler.tags = ['economy']
handler.command = /^(resetallcoins)$/i
handler.admin = true
handler.group = true

export default handler
