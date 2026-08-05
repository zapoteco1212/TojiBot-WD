import { startSubBot } from "../core/subs.js"
export default {
  name: "qr",
  category: "socket",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const caption = "`✤` Vincula con QR\n\n> 3 puntos > Dispositivos vinculados > Vincular dispositivo > Escanea el QR"
    const phone = m.sender.split("@")[0]
    await startSubBot(m, sock, caption, false, phone, jid, {}, true)
  }
}
