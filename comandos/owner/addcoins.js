export default {
  name: "addcoins",
  alias: ["givecoins","darcoins","addcoin"],
  category: "owner",
  async execute(sock, m, args) {
    let who = m.mentionedJid?.[0] || (m.quoted? m.quoted.sender : null)
    if (!who) return sock.sendMessage(m.key.remoteJid, { text: "❌ Menciona o responde a alguien.\nEj: *taddcoins @user 1000*" }, { quoted: m })
    let cant = parseInt(args[0]?.replace(/[^0-9]/g,"") || args[1])
    if (!cant) return sock.sendMessage(m.key.remoteJid, { text: "❌ Pon la cantidad" }, { quoted: m })

    try {
      let db = global.db.data.users[who] || {}
      db.coin = (db.coin || 0) + cant
      db.coins = (db.coins || 0) + cant
      db.money = (db.money || 0) + cant
      global.db.data.users[who] = db
      await sock.sendMessage(m.key.remoteJid, { text: `✅ *${cant} coins* agregados a @${who.split("@")[0]}`, mentions: [who] }, { quoted: m })
    } catch {
      await sock.sendMessage(m.key.remoteJid, { text: `✅ Coins dados: ${cant}` }, { quoted: m })
    }
  }
}
