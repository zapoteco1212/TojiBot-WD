import { getUser, addCoins } from "../../core/econ.js"
export default {
  name: "apostar",
  category: "juegos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const sender = m.key.participant || jid
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").toLowerCase()
    const args = text.split(" ")
    const eleccion = args[1]
    const cantidad = parseInt(args[2])

    if (!eleccion ||!cantidad ||!["cara","cruz"].includes(eleccion)) {
      await sock.sendMessage(jid, { text: `🎰 *APOSTAR*\nUso: #apostar cara/cruz cantidad\nEj: #apostar cara 100` }, { quoted: m })
      return
    }

    const user = getUser(sender)
    if (user.coins < cantidad) {
      await sock.sendMessage(jid, { text: `❌ No tienes suficientes coins\nTienes: ${user.coins}` }, { quoted: m })
      return
    }
    if (cantidad < 50) {
      await sock.sendMessage(jid, { text: `❌ Apuesta minima 50 coins` }, { quoted: m })
      return
    }

    const resultado = Math.random() < 0.5? "cara" : "cruz"
    if (eleccion === resultado) {
      addCoins(sender, cantidad)
      await sock.sendMessage(jid, { text: `🎉 *GANASTE*\nSalió: ${resultado.toUpperCase()}\nGanaste: ${cantidad}\nSaldo: ${user.coins + cantidad}` }, { quoted: m })
    } else {
      addCoins(sender, -cantidad)
      await sock.sendMessage(jid, { text: `💀 *PERDISTE*\nSalió: ${resultado.toUpperCase()}\nPerdiste: ${cantidad}\nSaldo: ${user.coins - cantidad}` }, { quoted: m })
    }
  }
}
