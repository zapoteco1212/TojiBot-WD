cd ~/TojiBot-WD
rm index.js
cat > index.js << 'EOF'
// TojiBot-WD by zapoteco1212 - INDEX QR FIXED 100% - Baileys 6.7.18 - FIX NODE 26
import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import NodeCache from 'node-cache'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__filename)

cfonts.say('TojiBot-WD', { font: 'chrome', align: 'center', gradient: ['red', 'yellow'] })
cfonts.say('by zapoteco1212', { font: 'console', align: 'center', gradient: ['cyan', 'blue'] })

console.log('[ TojiBot-WD ] Iniciando...')

global.opts = new Object(yargs(hideBin(process.argv)).parse())
const msgRetryCounterCache = new NodeCache()
const msgRetryCounterMap = (Message) => {
  const id = lodash.get(Message, 'key.id')
  if (id && msgRetryCounterCache) {
    const counter = msgRetryCounterCache.get(id)
    return counter ? counter + 1 : 1
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, './Session'))
  const { version } = await fetchLatestBaileysVersion()
  
  global.db = new Low(new JSONFile(join(__dirname, './database.json')), { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {} })
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
    printQRInTerminal: false,
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
      console.log('\n[ TojiBot-WD ] ESCANEA EL QR\n')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(`[ TojiBot-WD ] Conexion cerrada: ${reason}`)
      if (reason !== DisconnectReason.loggedOut) {
        console.log('[ TojiBot-WD ] Reconectando...')
        start()
      } else {
        console.log('[ TojiBot-WD ] Sesion cerrada, borra Session y vuelve a escanear')
      }
    }
    if (connection === 'open') {
      console.log('[ TojiBot-WD ] CONECTADO CON EXITO')
    }
  })

  let handler
  try {
    handler = await import('./handler.js')
  } catch {
    console.log('[ FIX ] handler.js no existe, cargando main.js...')
    handler = await import('./main.js')
  }
  
  conn.handler = handler.handler.bind(conn)
  conn.ev.on('messages.upsert', conn.handler)
  if(handler.participantsUpdate) conn.ev.on('group-participants.update', handler.participantsUpdate.bind(conn))
  if(handler.groupsUpdate) conn.ev.on('groups.update', handler.groupsUpdate.bind(conn))
  if(handler.deleteUpdate) conn.ev.on('message.delete', handler.deleteUpdate.bind(conn))
  if(handler.callUpdate) conn.ev.on('call', handler.callUpdate.bind(conn))

  setInterval(async () => { if (global.db.data) await global.db.write().catch(console.error) }, 10 * 1000)
}

start()

watchFile(__filename, () => {
  unwatchFile(__filename)
  console.log('[ TojiBot-WD ] index.js actualizado')
})
EOF
