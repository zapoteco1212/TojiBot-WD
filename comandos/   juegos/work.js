import { addCoins, getCooldown, setCooldown } from "../core/econ.js"

export default {
  name: "work",
  alias: ["trabajar", "chambear"],
  category: "juegos",
  description: "Trabaja y gana monedas",

  async execute(m, { sock }) {
    const cooldown = getCooldown(m.sender, "work")
    if (cooldown > 0) {
      const seg = Math.ceil(cooldown / 1000)
      const min = Math.floor(seg / 60)
      const s = seg % 60
      return sock.sendMessage(m.chat, {
        text: `⏳ *Ya trabajaste*\n\nVuelve en: *${min}m ${s}s* para volver a chambear.`
      }, { quoted: m })
    }

    const trabajos = [
      "👨‍💻 Programador",
      "👷 Albañil",
      "🍔 Cocinero",
      "🚚 Repartidor",
      "👮 Policía",
      "👨‍🏫 Maestro",
      "🎨 Diseñador",
      "⛏️ Minero"
    ]

    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const ganancia = Math.floor(Math.random() * (500 - 150 + 1)) + 150

    addCoins(m.sender, ganancia)
    setCooldown(m.sender, "work", 5 * 60 * 1000) // 5 minutos

    await sock.sendMessage(m.chat, {
      text: `✅ *TRABAJO COMPLETADO*\n\n💼 Trabajo: ${trabajo}\n💰 Ganaste: *${ganancia} coins*\n\nUsa #bal para ver tu dinero`
    }, { quoted: m })
  }
}
