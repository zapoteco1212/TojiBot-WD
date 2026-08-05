import { getUser, addCoins, setCooldown } from "../../core/econ.js"
export default {
  name: "work",
  category: "juegos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const sender = m.key.participant || jid
    const user = getUser(sender)
    const now = Date.now()
    if (now - user.lastWork < 60000) {
      const sec = Math.ceil((60000 - (now - user.lastWork))/1000)
      await sock.sendMessage(jid, { text: `⏳ Espera ${sec}s para volver a trabajar` }, { quoted: m })
      return
    }
    const ganancia = Math.floor(Math.random() * 300) + 200
    addCoins(sender, ganancia)
    setCooldown(sender, "lastWork")
    await sock.sendMessage(jid, { text: `💼 Trabajaste y ganaste ${ganancia} coins 💰\nSaldo: ${user.coins + ganancia}` }, { quoted: m })
  }
}
