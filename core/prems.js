import { Browsers, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, jidDecode } from '@whiskeysockets/baileys'
import qrcode from "qrcode"
import NodeCache from 'node-cache'
import pino from 'pino'
import fs from 'fs'
import chalk from 'chalk'
import { smsg } from './message.js'
import { handler as mainHandler } from '../handler.js'

if (!global.conns) global.conns = []

const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 })
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

async function loadEvents(conn) {
try {
const { default: events } = await import('./events.js')
await events(conn)
} catch {}
}

export async function startPremBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
const id = phone || (m?.sender || '').split('@')[0]
const sessionFolder = `./Sessions/Prems/${id}`
const senderId = m?.sender

const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
const { version } = await fetchLatestBaileysVersion()

console.info = () => {}
const sock = makeWASocket({
logger: pino({ level: 'silent' }),
printQRInTerminal: false,
browser: Browsers.macOS('Chrome'),
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
},
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
syncFullHistory: false,
getMessage: async () => ({ conversation: '' }),
msgRetryCounterCache,
userDevicesCache,
cachedGroupMetadata: async (jid) => groupCache.get(jid),
version,
keepAliveIntervalMs: 60_000,
maxIdleTimeMs: 120_000,
})

sock.isInit = false
sock.ev.on('creds.update', saveCreds)

sock.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
} else return jid
}

sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
if (isNewLogin) sock.isInit = false

if (connection === 'open') {
sock.uptime = Date.now()
sock.isInit = true
sock.userId = cleanJid(sock.user?.id?.split('@')[0])
const botDir = sock.userId + '@s.whatsapp.net'

if (!global.db.data.settings[botDir]) {
global.db.data.settings[botDir] = {}
}

// Ajustes específicos PREM
global.db.data.settings[botDir].type = 'Prem'
global.db.data.settings[botDir].jid = botDir
global.db.data.settings[botDir].botprem = true
global.db.data.settings[botDir].botmod = false
global.db.data.settings[botDir].isPremBot = true

if (!global.conns.find((c) => c.userId === sock.userId)) {
global.conns.push(sock)
}

delete reintentos[sock.userId || id]
await joinChannels(sock)
console.log(chalk.magentaBright(`[ PREM-BOT ] Conectado: ${sock.userId}`))
}

if (connection === 'close') {
const botId = sock.userId || id
const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode || lastDisconnect?.reason || 0
const intentos = reintentos[botId] || 0
reintentos[botId] = intentos + 1

if ([401, 403, 405].includes(reason) || reason == DisconnectReason.loggedOut) {
if (intentos < 5) {
console.log(chalk.yellow(`[ PREM-BOT ] ${botId} Cerrado (${reason}) intento ${intentos}/5 → Reintentando...`))
setTimeout(() => startPremBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 3000)
} else {
console.log(chalk.red(`[ PREM-BOT ] ${botId} Falló tras 5 intentos. Eliminando sesión.`))
try { fs.rmSync(sessionFolder, { recursive: true, force: true }) } catch {}
delete reintentos[botId]
const idx = global.conns.findIndex(c => c.userId === botId)
if (idx >= 0) global.conns.splice(idx, 1)
}
return
}

if ([DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.timedOut, DisconnectReason.connectionReplaced, DisconnectReason.restartRequired].includes(reason)) {
setTimeout(() => startPremBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 3000)
return
}
setTimeout(() => startPremBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 3000)
}

if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
try {
let codeGen = await sock.requestPairingCode(phone)
codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen
const msg = await client.reply(chatId, caption, m)
const msgCode = await client.reply(chatId, codeGen, m)
delete commandFlags[senderId]
setTimeout(async () => {
try {
await client.sendMessage(chatId, { delete: msg.key })
await client.sendMessage(chatId, { delete: msgCode.key })
} catch {}
}, 60000)
} catch (err) {
console.error("[Código Error]", err)
}
}

if (qr &&!isCode && client && chatId && commandFlags[senderId]) {
try {
const buffer = await qrcode.toBuffer(qr, { scale: 8 })
const msgQR = await client.sendMessage(chatId, { image: buffer, caption }, { quoted: m })
delete commandFlags[senderId]
setTimeout(async () => {
try { await client.sendMessage(chatId, { delete: msgQR.key }) } catch {}
}, 60000)
} catch (err) {
console.error("[QR Error]", err)
}
}
})

sock.ev.on('messages.upsert', async ({ messages, type }) => {
if (type!== 'notify') return
for (let raw of messages) {
if (!raw.message) continue
let msg = await smsg(sock, raw)
try {
await mainHandler.call(sock, msg)
} catch (err) {
console.log(chalk.gray(`[ PREM ] → ${err}`))
}
}
})

await loadEvents(sock).catch(e => console.log(chalk.gray(`[ PREM-EVENTS ] → ${e}`)))

return sock
}

async function joinChannels(client) {
if (!global.my) return
for (const value of Object.values(global.my)) {
if (typeof value === 'string' && value.endsWith('@newsletter')) {
await client.newsletterFollow(value).catch(() => {})
}
}
                              }
