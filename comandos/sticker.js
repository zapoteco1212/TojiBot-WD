module.exports = {
  name: "sticker",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
    const img = quoted?.imageMessage || m.message.imageMessage
    if (!img) return sock.sendMessage(jid, { text: "Responde a una imagen con.sticker" })
    const buffer = await sock.downloadMediaMessage({ message: { imageMessage: img } })
    await sock.sendMessage(jid, { sticker: buffer })
  }
}
