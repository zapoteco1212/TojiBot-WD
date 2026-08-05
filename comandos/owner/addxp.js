export default {
  name: "addxp",
  alias: ["givexp","darxp"],
  category: "owner",
  async execute(sock, m, args) {
    let who = m.mentionedJid?.[0] || (m.quoted? m.quoted.sender : null)
    if (!who) return sock.sendMessage(m.key.remoteJid, { text: "❌ Menciona a alguien\nEj: *taddxp @user 500*" }, { quoted: m })
    let cant = parseInt(args[0]?.replace(/[^0-9]/g,"") || args[1])
    if (!cant) return sock.sendMessage(m.key.remoteJid, { text: "❌ Pon la cantidad" }, { quoted: m })

    let db = global.db.data.users[who] || {}
    db.exp = (db.exp || 0) + cant
    db.xp = (db.xp || 0) + cant
    global.db.data.users[who] = db
    await sock.sendMessage(m.key.remoteJid, { text: `✅ *${cant} XP* dados a @${who.split("@")[0]}`, mentions: [who] }, { quoted: m })
  }
}
