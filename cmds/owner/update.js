import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
await conn.reply(m.chat, '⏳ *Actualizando bot desde GitHub...*\n> Ejecutando `git pull`', m)

exec('git pull', async (error, stdout, stderr) => {
let output = stdout || stderr || ''
let msg = ''

if (error) {
msg = `❌ *Error al actualizar:*\n\`\`\`${error.message}\`\`\``
} else if (output.includes('Already up to date.')) {
msg = 'ꕥ *Estado:* Todo está actualizado, no hay cambios nuevos.'
} else if (output.trim() == '') {
msg = 'ꕥ *Actualización completada* (sin salida)'
} else {
msg = `✅ *Actualización completada*\n\n\`\`\`${output.substring(0, 3500)}\`\`\``
}

await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
})
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = /^(update|actualizar)$/i
handler.owner = true
handler.rowner = true

export default handler
