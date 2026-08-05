import { getUser } from "../../core/econ.js"
import fs from "fs"

export default {
  name: "bal",
  alias: ["billetera", "coins", "cartera", "wallet"],
  category: "juegos",
  async execute(sock, m) {
    const id = m.key.participant || m.key.remoteJid
    const jid = m.key.remoteJid
    const user = getUser(id)

    const db = JSON.parse(fs.readFileSync("./database/economy.json", "utf-8"))
    const allUsers = Object.entries(db).sort((a,b) => b[1].coins - a[1].coins)
    const rank = allUsers.findIndex(([uid]) => uid === id) + 1

    let rango = "🌱 Novato"
    if (user.coins >= 10000) rango = "👑 Millonario"
    else if (user.coins >= 5000) rango = "💎 Rico"
    else if (user.coins >= 1000) rango = "💰 Acomodado"

    const text = `╭━━━━━━━━━━━━━━━━━━⬣
┃ 💳 *BILLETERA TOJI* 💳
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 👤 *USUARIO* 〕━━━⬣
┃ ✦ *ID:* ${id.split("@")[0]}
┃ ✦ *Rango:* ${rango}
┃ ✦ *Puesto:* #${rank} en el Top
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 💰 *ECONOMÍA* 〕━━━⬣
┃ ✦ *TojiCoins:* ${user.coins.toLocaleString()} 🪙
┃ ✦ *Banco:* ${user.bank || 0} 🏦
┃ ✦ *Total:* ${(user.coins + (user.bank || 0)).toLocaleString()} 💵
╰━━━━━━━━━━━━━━━━━━⬣

> Usa #daily para reclamar 500 diario
> Usa #work para ganar más`

    await sock.sendMessage(jid, { text }, { quoted: m })
  }
}
