import os from 'os'

function rTime(seconds) {
seconds = Number(seconds)
let d = Math.floor(seconds / (3600 * 24))
let h = Math.floor((seconds % (3600 * 24)) / 3600)
let m = Math.floor((seconds % 3600) / 60)
let s = Math.floor(seconds % 60)
let dDisplay = d > 0? d + (d === 1? " día, " : " días, ") : ""
let hDisplay = h > 0? h + (h === 1? " hora, " : " horas, ") : ""
let mDisplay = m > 0? m + (m === 1? " minuto, " : " minutos, ") : ""
let sDisplay = s > 0? s + (s === 1? " segundo" : " segundos") : ""
return dDisplay + hDisplay + mDisplay + sDisplay
}

let handler = async (m, { conn, usedPrefix, command }) => {
try {
let botId = conn.user.jid
let mainBotId = global.conn?.user?.jid || botId
let isOficialBot = botId === mainBotId

let botSettings = global.db.data.settings[botId] || {}
let botname = botSettings.botname || botSettings.namebot || 'TojiBot-WD'
let namebot = botSettings.namebot || botname
let monedas = botSettings.currency || 'Coins'
let banner = botSettings.banner || ''
let prefijo = botSettings.prefix || global.prefix || '.'
let owner = botSettings.owner || global.owner[0][0] + '@s.whatsapp.net'
let canalId = botSettings.id || global.ch?.id || ''
let canalName = botSettings.nameid || global.ch?.name || 'TojiBot-WD Channel'
let link = botSettings.link || ''

let desar = 'Oculto'
if (owner &&!isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
let userData = global.db.data.users[owner]
desar = userData?.genre || 'Oculto'
}

let platform = os.type()
let nodeVersion = process.version
let sistemaUptime = rTime(os.uptime())
let uptime = process.uptime()
let colombianTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }))
let uptimeDate = new Date(colombianTime.getTime() - uptime * 1000)
let formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
}).replace(/^./, s => s.toUpperCase())

let botType = isOficialBot? 'Principal/Owner' : 'Sub Bot'

let message = `✐ Información del bot *${botname}!*

✿ *Nombre Corto ›* ${namebot}
✿ *Nombre Largo ›* ${botname}
✦ *Moneda ›* ${monedas}
✦ *Prefijo${Array.isArray(prefijo) && prefijo.length > 1? 's' : ''} ›* ${Array.isArray(prefijo)? prefijo.map(p => `\`${p}\``).join(', ') : `\`${prefijo}\``}

❒ *Tipo ›* ${botType}
❒ *Plataforma ›* ${platform}
❒ *NodeJS ›* ${nodeVersion}
❒ *Activo desde ›* ${formattedUptimeDate}
❒ *Sistema Activo ›* ${sistemaUptime}
❒ *${desar === 'Hombre'? 'Dueño' : desar === 'Mujer'? 'Dueña' : 'Dueño(a)'} ›* ${owner.includes('@')? `@${owner.split('@')[0]}` : owner}

> \`Enlace:\` ${link}`.trim()

let contextOptions = {
mentionedJid: [owner, m.sender].filter(Boolean),
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: canalId,
serverMessageId: '',
newsletterName: canalName
}
}

let isVideo = banner && (banner.includes('.mp4') || banner.includes('.webm'))

if (banner) {
let mediaMsg = await conn.sendMessage(m.chat, isVideo? { video: { url: banner }, gifPlayback: true } : { image: { url: banner } }, { quoted: m })
await conn.sendMessage(m.chat, { text: message, contextInfo: contextOptions }, { quoted: mediaMsg })
} else {
await conn.sendMessage(m.chat, { text: message, contextInfo: contextOptions }, { quoted: m })
}

} catch (e) {
console.error(e)
return conn.reply(m.chat, `> Error en *${usedPrefix + command}*: ${e.message}`, m)
}
}

handler.help = ['infobot', 'infosocket', 'botinfo']
handler.tags = ['info']
handler.command = /^(infobot|infosocket|botinfo)$/i

export default handler
