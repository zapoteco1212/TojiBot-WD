import fs from 'fs'
import os from 'os'

function getDefaultHostId() {
if (process.env.HOSTNAME) {
return process.env.HOSTNAME.split('-')[0]
}
return 'default_host_id'
}

function formatBytes(bytes) {
let sizes = ['B', 'KB', 'MB', 'GB']
if (bytes == 0) return '0 B'
let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

function toNum(number) {
if (number >= 1000 && number < 1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number >= 1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else {
return number.toString()
}
}

let handler = async (m, { conn }) => {
let hostId = getDefaultHostId()
let registeredGroups = global.db.data.chats? Object.keys(global.db.data.chats).length : 0

let botId = conn.user.jid
let botSettings = global.db.data.settings[botId] || {}
let botname = botSettings.botname || botSettings.namebot || 'TojiBot-WD'

let userCount = Object.keys(global.db.data.users).length || '0'
let totalCommands = Object.values(global.db.data.users).reduce((acc, user) => acc + (user.usedcommands || 0), 0)

let estadoBot = `「❀」 Estado de *${botname}* (●´ϖ\`●)
◇ *Usuarios registrados ›* ${userCount.toLocaleString()}
◇ *Grupos registrados ›* ${registeredGroups.toLocaleString()}
◇ *Comandos ejecutados ›* ${toNum(totalCommands)}`

let sistema = os.type()
let cpu = os.cpus().length
let ramTotal = formatBytes(os.totalmem())
let ramUsada = formatBytes(os.totalmem() - os.freemem())
let arquitectura = os.arch()

let estadoServidor = `➭ Estado del Servidor *₍ᐢ..ᐢ₎♡*

❖ *Sistema ›* ${sistema}
❖ *CPU ›* ${cpu} cores
❖ *RAM ›* ${ramTotal}
❖ *RAM Usado ›* ${ramUsada}
❖ *Arquitectura ›* ${arquitectura}
❖ *Host ID ›* ${hostId}

*❑ Uso de Memoria NODEJS*
◆ *Ram Utilizada* › ${formatBytes(process.memoryUsage().rss)}
◆ *Heap Reservado* › ${formatBytes(process.memoryUsage().heapTotal)}
◆ *Heap Usado* › ${formatBytes(process.memoryUsage().heapUsed)}
◆ *Módulos Nativos* › ${formatBytes(process.memoryUsage().external)}
◆ *Buffers de Datos* › ${formatBytes(process.memoryUsage().arrayBuffers)}`

let mensajeEstado = `${estadoBot}\n\n${estadoServidor}`
await conn.reply(m.chat, mensajeEstado, m)
}

handler.help = ['status', 'estado']
handler.tags = ['info']
handler.command = /^(status|estado)$/i

export default handler
