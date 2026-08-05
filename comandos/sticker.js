export default {
  name: "s",
  category: "comandos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const imgMsg = quoted?.imageMessage || m.message?.imageMessage
    const videoMsg = quoted?.videoMessage || m.message?.videoMessage
    if (!imgMsg && !videoMsg) {
      await sock.sendMessage(jid, { text: "Responde a una imagen o video con #s" }, { quoted: m })
      return
    }
    try {
      const msgToDownload = imgMsg ? { message: { imageMessage: imgMsg } } : { message: { videoMessage: videoMsg } }
      const source = m.message?.imageMessage || m.message?.videoMessage ? m : msgToDownload
      const buffer = await sock.downloadMediaMessage(source)
      await sock.sendMessage(jid, { sticker: buffer }, { quoted: m })
    } catch (e) {
      await sock.sendMessage(jid, { text: "Error: " + e.message }, { quoted: m })
    }
  }
}
