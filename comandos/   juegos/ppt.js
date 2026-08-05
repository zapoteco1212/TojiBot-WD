export default {
  name: "ppt",
  async execute(sock, m, args) {
    const opciones = ["piedra", "papel", "tijera"]
    const user = args[0]?.toLowerCase()
    if (!opciones.includes(user)) {
      await sock.sendMessage(m.key.remoteJid, { text: "Usa:!ppt piedra / papel / tijera" }, { quoted: m })
      return
    }
    const bot = opciones[Math.floor(Math.random() * 3)]
    let resultado = ""
    if (user === bot) resultado = "Empate 😐"
    else if ((user === "piedra" && bot === "tijera") || (user === "papel" && bot === "piedra") || (user === "tijera" && bot === "papel")) resultado = "Ganaste! 🎉"
    else resultado = "Perdiste 😅"

    await sock.sendMessage(m.key.remoteJid, { text: `Tú: ${user}\nYo: ${bot}\n${resultado}` }, { quoted: m })
  }
}