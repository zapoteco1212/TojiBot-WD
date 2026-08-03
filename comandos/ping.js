module.exports = {
  name: "ping",
  async execute(sock, m) {
    await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong! TojiBot-WD activo" })
  }
}
