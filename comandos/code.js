const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')

module.exports = {
  name: "code",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid
    if (!args[0]) return sock.sendMessage(jid, { text: "Uso:.code 521XXXXXXXXXX" })
    try {
      const { state } = await useMultiFileAuthState('tempCode')
      const tmp = makeWASocket({ auth: state, logger: P({ level: 'silent' }) })
      const code = await tmp.requestPairingCode(args[0])
      await sock.sendMessage(jid, { text: `Tu CODE para ${args[0]} es: *${code}*` })
    } catch {
      await sock.sendMessage(jid, { text: "Error generando code, verifica el numero" })
    }
  }
}
