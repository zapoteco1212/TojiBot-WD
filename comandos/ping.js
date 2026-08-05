export default {
  name: "ping",
  async execute(sock, m, args) {
    await sock.sendMessage(m.key.remoteJid, { text: "pong! 🏓" }, { quoted: m })
  }
}
