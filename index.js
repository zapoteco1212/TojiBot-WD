import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import cfonts from 'cfonts'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__filename)

cfonts.say('TojiBot-WD', { font: 'chrome', align: 'center', gradient: ['cyan', 'blue'] })
console.log('[ TojiBot-WD ] Iniciando...')

const msgRetryCounterCache = new NodeCache()

// CARGAR COMANDOS PRIMERO
console.log('[ TojiBot-WD ] Cargando comandos...')
const { default: seeCommands } = await import('./core/commands.js')
await seeCommands()
console.log('[ TojiBot-WD ] Comandos cargados ✅')

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    msgRetryCounterCache,
    browser: ['TojiBot-WD', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)
  
  const { default: handler } = await import('./core/handler.js')
  sock.ev.on('messages.upsert', async (m) => handler(m, sock))
  
  sock.ev.on('connection.update', async (update) => {
    const { connection } = update
    if(connection === 'open') console.log('⛩️ TOJIBOT-WD CONECTADO')
  })
}

start()
