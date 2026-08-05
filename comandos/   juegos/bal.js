import { getUser } from "../../core/econ.js"

export default {
  name: "bal",
  alias: ["billetera", "coins", "cartera", "wallet"],
  run: async (sock, msg, args) => {
    const id = msg.key.participant || msg.key.remoteJid
    const user = getUser(id)
    await sock.sendMessage(msg.key.remoteJid, {
      text: `💰 *Billetera*\n\nTienes: *${user.coins}* TojiCoins`
    }, { quoted: msg })
  }
}
