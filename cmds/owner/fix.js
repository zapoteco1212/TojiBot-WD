import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const execPromise = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
try {
await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

await execPromise('git config user.email "bot@host.com"')
await execPromise('git config user.name "TojiBot-WD"')
await execPromise('git fetch origin')

const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD')
const currentBranch = branch.trim()

const { stdout: diffStatus } = await execPromise(`git diff --name-status HEAD..origin/${currentBranch}`).catch(() => ({ stdout: '' }))
const { stdout: info } = await execPromise(`git log HEAD..origin/${currentBranch} --format="%an" -1`).catch(() => ({ stdout: 'Desconocido' }))

const lines = diffStatus.trim().split('\n').filter(line => line.trim() !== '')
const totalFiles = lines.length

if (totalFiles > 0) {
await execPromise(`git reset --hard origin/${currentBranch}`)

// Recargar plugins estilo TojiBot
const pluginsPath = path.join(__dirname, '..', 'plugins')
const files = fs.readdirSync(pluginsPath)
for (let file of files) {
if (file.endsWith('.js')) {
try {
delete (await import(`file://${path.join(pluginsPath, file)}?update=${Date.now()}`))
} catch {}
}
}

let changeList = lines.map(line => {
const [status, ...fileParts] = line.split(/\s+/)
const file = fileParts.join(' ')
switch (status) {
case 'A': return `+ ${file}`
case 'M': return `• ${file}`
case 'D': return `- ${file}`
default: return `? ${file}`
}
}).slice(0, 20).join('\n')

let msg = `❀ *Actualización exitosa - TojiBot-WD*\n\n`
msg += `亗 *Editor:* ${info.trim()}\n`
msg += `✎ *Total Cambios:* ${totalFiles}\n\n`
msg += `ꕥ *Detalles:*\n\`\`\`${changeList}${totalFiles > 20 ? '\n...entre otros.' : ''}\`\`\``

await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
} else {
await conn.sendMessage(m.chat, { text: 'ꕥ *Estado:* TojiBot ya está en su última versión.' }, { quoted: m })
}

await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

if (global.db && global.db.data) {
await global.db.write()
}

} catch (error) {
console.error(error)
await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
await conn.reply(m.chat, `*⚠️ ERROR EN FIX:*\n\n${error.message}`, m)
}
}

handler.help = ['fix']
handler.tags = ['owner']
handler.command = /^(fix|actualizar|update|actualizacion)$/i
handler.rowner = true

export default handler
