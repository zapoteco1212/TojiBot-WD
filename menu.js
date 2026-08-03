module.exports = {
  name: "menu",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const menu = `
╭━━━〔 *TojiBot-WD* 〕━━━⬣
┃ ✦ .ping - ver si estoy vivo
┃ ✦ .menu - este menu
┃ ✦ .sticker - haz sticker (responde a imagen)
┃ ✦ .code + numero - dar code
╰━━━━━━━━━━━━━━⬣

> Bot hecho por Toji
`
    await sock.sendMessage(jid, { text: menu })
  }
}
