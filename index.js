// TojiBot-WD by zapoteco1212 - INDEX QR FIXED 100% - Baileys 6.7.18
import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import NodeCache from 'node-cache'
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__filename)

cfonts.say('TojiBot-WD', { font: 'chrome', align: 'center', gradient: ['red', 'yellow'] })
cfonts.say('by zapoteco1212', { font: 'console', align: 'center', gradient: ['cyan', 'blue'] })

console.log('[ TojiBot-WD ] Iniciando... ⚔️')

global.opts = new Object(yargs(process.argv.slice(2)).exitChecks(false).parse())
const msgRetryCounterCache = new NodeCache()
const msgRetryCounterMap = (Message) => {
  const { msgRetryCounterCache: _msgRetryCounterCache } = Message
  const id = lodash.get(Message, 'key.id')
  if (id && _msgRetryCounterCache) {
    const counter = _msgRetryCounterCache.get(id)
    return counter ? counter + 1 : 1
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, './Session'))
  const { version } = await fetchLatestBaileysVersion()
  
  global.db = new Low(new JSONFile(join(__dirname, './database.json')))
  await global.db.read()
  global.db.data = global.db.data || { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {}) }
  global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) { clearInterval(this); resolve(global.db.data == null ? global.loadDatabase() : global.db.data) }
    }, 1 * 1000))
    if (global.db.data !== null) return
    global.db.READ = true
    await global.db.read().catch(console.error)
    global.db.READ = null
    global.db.data = { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {}) }
    global.db.chain = lodash.chain(global.db.data)
  }
  await global.loadDatabase()

  const conn = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // lo imprimimos nosotros mejor
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: Browsers.macOS('Chrome'),
    msgRetryCounterCache,
    msgRetryCounterMap,
    getMessage: async (key) => {
      if (global.db.data.msgs[key.id]) return global.db.data.msgs[key.id]
      return { conversation: 'TojiBot-WD by zapoteco1212' }
    }
  })

  conn.ev.on('creds.update', saveCreds)

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log('\n[ TojiBot-WD ] ESCANEA EL QR ⚔️\n')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(`[ TojiBot-WD ] Conexión cerrada: ${reason}`)
      if (reason !== DisconnectReason.loggedOut) {
        console.log('[ TojiBot-WD ] Reconectando...')
        start()
      } else {
        console.log('[ TojiBot-WD ] Sesión cerrada, borra Session y vuelve a escanear')
      }
    }
    if (connection === 'open') {
      console.log('[ TojiBot-WD ] CONECTADO CON ÉXITO ⚔️')
    }
  })

  // Cargar handler
  const handler = await import('./handler.js')
  conn.handler = handler.handler.bind(conn)
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('group-participants.update', handler.participantsUpdate.bind(conn))
  conn.ev.on('groups.update', handler.groupsUpdate.bind(conn))
  conn.ev.on('message.delete', handler.deleteUpdate.bind(conn))
  conn.ev.on('call', handler.callUpdate.bind(conn))

  setInterval(async () => { if (global.db.data) await global.db.write().catch(console.error) }, 10 * 1000)
}

start()

watchFile(__filename, () => {
  unwatchFile(__filename)
  console.log('[ TojiBot-WD ] index.js actualizado')
})
