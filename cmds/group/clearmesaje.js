let handler = async (m, { conn }) => {
let users = global.db.data.users
let count = 0

for (let jid in users) {
if (users[jid].mensajes) {
users[jid].mensajes = 0
count++
}
}

return conn.reply(m.chat, `✅ Base de datos limpiada. Se reiniciaron los contadores de *${count}* usuarios a 0.`, m)
}

handler.help = ['resetmensajes']
handler.tags = ['owner']
handler.command = /^(resetmensajes)$/i
handler.owner = true
handler.rowner = true

export default handler
