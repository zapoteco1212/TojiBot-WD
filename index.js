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

    const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const prefix = "."
    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    const cmdPath = path.join(__dirname, 'comandos', `${command}.js`)
    if (fs.existsSync(cmdPath)) {
      try {
        const cmd = require(cmdPath)
        await cmd.execute(sock, m, args)
      } catch (e) {
        console.log(e)
        await sock.sendMessage(m.key.remoteJid, { text: "Error en el comando" })
      }
    }
  })
}

TojiBot()
