export default {
  name: "bal",
  alias: ["billetera"],
  run: async (sock, msg, args) => {
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ El comando bal SI carga` }, { quoted: msg })
  }
}
