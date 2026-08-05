import { getUser } from "../../core/econ.js"

let handler = async (m, { sock }) => {
  const id = m.key.remoteJid
  const user = getUser(id)
  await sock.sendMessage(id, { text: `💰 Tienes: *${user.coins}* TojiCoins` }, { quoted: m })
}

handler.command = ["bal", "billetera", "coins"]
handler.tags = ["juegos"]
export default handler
