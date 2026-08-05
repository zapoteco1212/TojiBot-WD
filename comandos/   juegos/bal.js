import { getUser } from "../../core/econ.js"

export default {
  name: "bal",
  alias: ["billetera", "coins", "cartera", "wallet"],
  run: async (sock, msg, args) => {
    const id = msg.key.remoteJid
    const user = getUser(id)
    await sock.sendMessage(id, { 
      text: `💰 *Billetera*\n\nTienes: *${user.coins}* TojiCoins` 
    }, { quoted: msg })
  }
}
