cd ~/TojiBot-WD
rm index.js
cat > index.js << 'EOF'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import cfonts from 'cfonts'
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import NodeCache from 'node-cache'
import lodash from 'lodash'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__filename)

cfonts.say('TojiBot-WD', { font: 'chrome', align: 'center', gradient: ['red','yellow'] })

console.log('[ TojiBot-WD ] Iniciando...')

const msgRetryCounterCache = new NodeCache()

// CARGAR COMANDOS PRIMERO
console.log('[ TojiBot-WD ] Cargando comandos...')
const { default: seeCommands } = await import('./core/system/commandLoader.js')
await seeCommands()
console.log(`[ TojiBot-WD ] Comandos en memoria: ${global.comandos.size}`)

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, './Session'))
  const { version } = await fetchLatestBaileysVersion()

  global.db = new Low(new JSONFile(join(__dirname, './database.json')), { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {} })
  await global.db.read()
  global.db.data = global.db.data || { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {} }

  const conn = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    browser: Browsers.macOS('Chrome'),
    msgRetryCounterCache,
    getMessage: async (key) => ({ conversation: 'TojiBot-WD' })
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
      if (reason !== DisconnectReason.loggedOut) {
        console.log('[ TojiBot-WD ] Reconectando...')
        start()
      }
    }
    if (connection === 'open') {
      console.log('[ TojiBot-WD ] CONECTADO CON EXITO')
    }
  })

  // CARGAR HANDLER REAL
  let handlerMod
  try {
    handlerMod = await import('./core/main.js')
    console.log('[ TojiBot-WD ] Handler cargado: core/main.js')
  } catch (e) {
    console.log('[ TojiBot-WD ] Error cargando core/main.js', e.message)
    handlerMod = await import('./core/BotPrincipal.js').catch(()=>null)
  }

  const handler = handlerMod.default || handlerMod.handler || handlerMod
  conn.ev.on('messages.upsert', async (m) => {
    try {
      await handler(conn, m)
    } catch (e) {
      console.log('[ Handler Error ]', e)
    }
  })
}

start()
EOF

npm start
