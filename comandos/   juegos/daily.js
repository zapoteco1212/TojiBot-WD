import { getUser, addCoins } from "../../core/econ.js"

export default {
  name: "daily",
  alias: ["diario", "reclamar"],
  category: "juegos",
  async execute(sock, m) {
    const id = m.key.participant || m.key.remoteJid
    const jid = m.key.remoteJid
    const user = getUser(id)
    
    const now = Date.now()
    const cooldown = 24 * 60 * 60 * 1000 // 24h
    
    if (user.lastDaily && now - user.lastDaily < cooldown) {
      const remaining = cooldown - (now - user.lastDaily)
      const h = Math.floor(remaining / 3600000)
      const min = Math.floor((remaining % 3600000) / 60000)
      return await sock.sendMessage(jid, { text: `⏳ Ya reclamaste. Vuelve en ${h}h ${min}m` }, { quoted: m })
    }
    
    const reward = 500
    addCoins(id, reward)
    
    // guardar tiempo
    const fs = await import("fs")
    const db = JSON.parse(fs.readFileSync("./database/economy.json", "utf-8"))
    db[id].lastDaily = now
    fs.writeFileSync("./database/economy.json", JSON.stringify(db, null, 2))
    
    await sock.sendMessage(jid, { text: `✅ Reclamaste tu daily!\n💰 +${reward} TojiCoins` }, { quoted: m })
  }
}
