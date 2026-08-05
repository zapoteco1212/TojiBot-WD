import { getUser } from "../../core/econ.js"

export default {
  name: "bal",
  alias: ["billetera", "coins", "cartera"],
  category: "juegos",
  async execute(sock, m) {
    const id = m.key.participant || m.key.remoteJid
    const user = getUser(id)
    await sock.sendMessage(m.key.remoteJid, { 
      text: `💰 *Billetera*\n\nTienes: *${user.coins}* TojiCoins` 
    }, { quoted: m })
  }
}
