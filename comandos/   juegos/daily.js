import { addCoins, getCooldown, setCooldown, getUser } from "../../core/econ.js"

export default {
  name: "daily",
  category: "juegos",
  async execute(sock, m) {
    const id = m.key.participant || m.key.remoteJid
    const jid = m.key.remoteJid

    const cooldown = getCooldown(id, "daily")
    if (cooldown > 0) {
      const horas = Math.floor(cooldown / 3600000)
      const min = Math.floor((cooldown % 3600000) / 60000)
      return await sock.sendMessage(jid, { 
        text: `⏳ Ya reclamaste tu daily.\nVuelve en: *${horas}h ${min}m*` 
      }, { quoted: m })
    }

    addCoins(id, 500)
    setCooldown(id, "daily", 24 * 60 * 60 * 1000)

    await sock.sendMessage(jid, {
      text: `🎉 *DAILY RECLAMADO*\n\n💰 +500 coins a tu billetera`
    }, { quoted: m })
  }
}
