export default {
  name: "addowner",
  alias: ["darowner"],
  category: "owner",
  async execute(sock, m, args) {
    let num = args[0]?.replace(/[^0-9]/g,"") || m.mentionedJid?.[0]?.split("@")[0]
    if(!num) return sock.sendMessage(m.key.remoteJid,{text:"❌ Usa: taddowner 527444317595"}, {quoted:m})
    global.owner.push(num)
    await sock.sendMessage(m.key.remoteJid,{text:`✅ Owner agregado: +${num}\nYa puede usar taddcoins, taddxp, tfix`}, {quoted:m})
  }
}
