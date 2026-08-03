const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const path = require('path')
const P = require('pino')

async function TojiBot() {
  const { state, saveCreds } = await useMultiFileAuthState('TojiSession')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['TojiBot-WD', 'Chrome', '1.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // Cargar plugins
  const pluginsPath = path.join(__dirname, 'plugins')
  let plugins = []
  if (fs.existsSync(pluginsPath)) {
    plugins = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))
    console.log(`[TojiBot-WD] ${plugins.length} plugins encontrados`)
  }

  // Cargar comandos
  const comandosPath = path.join(__dirname, 'comandos')
  let comandos = []
  if (fs.existsSync(comandosPath)) {
    comandos = fs.readdirSync(comandosPath).filter(f => f.endsWith('.js'))
    console.log(`[TojiBot-WD] ${comandos.length} comandos encontrados`)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom)? lastDisconnect.error.output.statusCode!== DisconnectReason.loggedOut : true
      if (shouldReconnect) TojiBot()
    } else if (connection === 'open') {
      console.log('TojiBot-WD Conectado ✅')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const texto = m.message.conversation || m.message.extendedTextMessage?.text || ''
    console.log(`Mensaje: ${texto}`)

    // Aquí se ejecutarán tus comandos y plugins
    // Ejemplo: require('./plugins/tuarchivo.js')(sock, m, texto)
  })
}

TojiBot()
