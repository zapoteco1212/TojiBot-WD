export default {
  name: "ping",
alias: ["p", "velocidad", "speed"],
  async execute(sock, m, args) {
    await sock.sendMessage(m.key.remoteJid, { text: "pong! 🏓" }, { quoted: m })
  }
}
