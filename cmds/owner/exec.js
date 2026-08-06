import syntaxerror from 'syntax-error'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
if (!text.trim()) {
return conn.reply(m.chat, '《✧》 Debes escribir un código a ejecutar.', m)
}

let _text = (command === 'e'? 'return ' : '') + text
let old = m.exp * 1
let _return, _syntax = ''

try {
await m.react('🕒')
let i = 15
let f = { exports: {} }
let exec = new (async () => {}).constructor('print', 'm', 'conn', 'require', 'Array', 'process', 'args', 'module', 'exports', 'argument', _text)
_return = await exec.call(conn, (...args) => {
if (--i < 1) return
return conn.reply(m.chat, format(...args), m)
}, m, conn, require, Array, process, args, f, f.exports, [conn])

await m.react('✔️')
} catch (e) {
let err = syntaxerror(_text, 'Execution Function', {
allowReturnOutsideFunction: true,
allowAwaitOutsideFunction: true,
sourceType: 'module'
})
if (err) _syntax = '```' + err + '```\n\n'
_return = e
await m.react('✖️')
} finally {
await conn.reply(m.chat, _syntax + format(_return), m)
m.exp = old
}
}

handler.help = ['ex', 'e']
handler.tags = ['owner']
handler.command = /^(ex|e)$/i
handler.owner = true
handler.rowner = true

export default handler
