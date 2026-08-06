let handler = async (m, { conn }) => {
await conn.reply(m.chat, `✎ Reiniciando el Socket...\n> *Espere un momento...*`, m)
setTimeout(() => {
if (process.send) {
process.send("restart")
} else {
process.exit(0)
}
}, 3000)
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(restart|reiniciar|rs)$/i
handler.owner = true
handler.rowner = true

export default handler
