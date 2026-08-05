export default {
  name: "apostar",
  category: "juegos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").toLowerCase()
    const args = text.split(" ")
    const eleccion = args[1]
    const cantidad = parseInt(args[2]) || 100
    if (!eleccion ||!["cara", "cruz", "sello"].includes(eleccion)) {
      await sock.sendMessage(jid, { text: `🎰 *APOSTAR*\n\nUso: #apostar cara/cruz [cantidad]\nEjemplo: #apostar cara 100` }, { quoted: m })
      return
    }
    const resultado = Math.random() < 0.5? "cara" : "cruz"
    const gano = eleccion === resultado || (eleccion === "sello" && resultado === "cara")
    if (gano) {
      await sock.sendMessage(jid, { text: `🎉 *¡GANASTE!*\n\nSalió: ${resultado.toUpperCase()}\nGanaste: ${cantidad * 2} coins 💰` }, { quoted: m })
    } else {
      await sock.sendMessage(jid, { text: `💀 *PERDISTE*\n\nSalió: ${resultado.toUpperCase()}\nPerdiste: ${cantidad} coins` }, { quoted: m })
    }
  }
}
