export default {
  name: "menu",
  category: "comandos",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const uptime = process.uptime()
    const horas = Math.floor(uptime / 3600)
    const minutos = Math.floor((uptime % 3600) / 60)

    const menu = `╭━━━━━━━━━━━━━━━━━━⬣
┃  🤖 *TOJIBOT - WD* 🤖
┃  *Versión:* 2.0 Ultra
┃  *Creador:* Werki / Zapoteco
┃  *Activo:* ${horas}h ${minutos}m
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ *COMANDOS* 〕━━━⬣
┃ ✦ #ping ➳ Velocidad del bot
┃ ✦ #menu ➳ Este menú
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎮 *JUEGOS* 〕━━━⬣
┃ ✦ #ppt ➳ Piedra Papel Tijera
┃      Ej: #ppt piedra
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎨 *STICKERS* 〕━━━⬣
┃ ✦ #s / #sticker
┃   ↳ Responde a una imagen
╰━━━━━━━━━━━━━━━━━━⬣

> ✨ *Bot hecho por Toji - Zapoteco* ✨`

    await sock.sendMessage(jid, { text: menu }, { quoted: m })
  }
}
