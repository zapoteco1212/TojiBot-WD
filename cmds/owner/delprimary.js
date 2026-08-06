let handler = async (m, { conn }) => {
let db = global.db.data
let chats = db.chats
let count = 0

let chatIds = Object.keys(chats).filter(id => id.endsWith('@g.us'))

if (chatIds.length === 0) {
return conn.reply(m.chat, '❌ No hay grupos registrados en la base de datos.', m)
}

chatIds.forEach(id => {
if (chats[id].primaryBot) {
delete chats[id].primaryBot
count++
}
})

await conn.reply(m.chat, `*Limpieza Global Completada*\n\nSe ha eliminado el Bot Primario en *${count}* grupos. Ahora todos los SubBots responderán libremente en esos chats.`, m)
}

handler.help = ['resetprimary', 'delprimary']
handler.tags = ['owner']
handler.command = /^(resetprimary|delprimary)$/i
handler.owner = true
handler.rowner = true

export default handler
