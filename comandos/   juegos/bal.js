import { getUser } from "../../core/econ.js"
export default {
  name: "bal",
  run: async (sock, msg, args) => {
    const id = msg.key.remoteJid
    const user = getUser(id)
    const text = `💰 *Billetera*\n\nTienes: *${user.coins}* TojiCoins`
    await sock.sendMessage(id, { text }, { quoted: msg })
  }
}
