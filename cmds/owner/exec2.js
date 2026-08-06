import { exec } from "child_process"

let handler = async (m, { conn, text }) => {
if (!text) return conn.reply(m.chat, 'Ingresa un comando para ejecutar en la terminal.', m)

await conn.reply(m.chat, 'Ejecutando...', m)

exec(text, { timeout: 10000 }, (error, stdout, stderr) => {
let resultado = ''

if (error) {
resultado = `Error: ${error.message}`
} else if (stderr) {
resultado = `Stderr: ${stderr}`
} else {
resultado = stdout || 'Comando ejecutado sin salida.'
}

let mensajeFinal = `*Resultado de: ${text}*\n\n${resultado}`

conn.sendMessage(m.chat, { text: mensajeFinal.slice(0, 4000) }, { quoted: m })
})
}

handler.help = ['exec2', 'r']
handler.tags = ['owner']
handler.command = /^(exec2|r)$/i
handler.owner = true
handler.rowner = true

export default handler
