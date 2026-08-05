import { getUser } from "../../core/econ.js"
export default {
  name: "billetera",
  category: "juegos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const sender = m.key.participant || jid
    const user = getUser(sender)
    await sock.sendMessage(jid, { text: `💰 *BILLETERA*\n\n👤 Usuario: @${sender.split("@")[0]}\n💵 Coins: ${user.coins}\n\nComandos:\n#work - ganar 200-500\n#daily - 1000 diario\n#apostar cara 100`, mentions: [sender] }, { quoted: m })
  }
}
