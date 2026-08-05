import { getUser, addCoins, setCooldown } from "../../core/econ.js"
export default {
  name: "daily",
  category: "juegos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const sender = m.key.participant || jid
    const user = getUser(sender)
    const now = Date.now()
    if (now - user.lastDaily < 86400000) {
      const hrs = Math.ceil((86400000 - (now - user.lastDaily))/1000/3600)
      await sock.sendMessage(jid, { text: `⏳ Ya reclamaste tu daily, vuelve en ${hrs}h` }, { quoted: m })
      return
    }
    addCoins(sender, 1000)
    setCooldown(sender, "lastDaily")
    await sock.sendMessage(jid, { text: `
