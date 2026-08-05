import { addCoins, getCooldown, setCooldown, getUser } from "../../core/econ.js"

export default {
  name: "work",
  alias: ["trabajar", "chambear"],
  category: "juegos",
  async execute(sock, m) {
    const id = m.key.participant || m.key.remoteJid
    const jid = m.key.remoteJid
    
    const cooldown = getCooldown(id, "work")
    if (cooldown > 0) {
      const seg = Math.ceil(cooldown / 1000)
      const min = Math.floor(seg / 60)
      const s = seg % 60
      return await sock.sendMessage(jid, { 
        text: `⏳ *Ya trabajaste*\n\nVuelve en: *${min}m ${s}s*` 
      }, { quoted: m })
    }

    const trabajos = ["👨‍💻 Programador","👷 Albañil","🍔 Cocinero","🚚 Repartidor","👮 Policía","👨‍🏫 Maestro"]
    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const ganancia = Math.floor(Math.random() * (500 - 150 + 1)) + 150

    addCoins(id, ganancia)
    setCooldown(id, "work", 5 * 60 * 1000)

    await sock.sendMessage(jid, {
      text: `✅ *TRABAJO COMPLETADO*\n\n💼 Trabajo: ${trabajo}\n💰 Ganaste: *${ganancia} coins*`
    }, { quoted: m })
  }
}
