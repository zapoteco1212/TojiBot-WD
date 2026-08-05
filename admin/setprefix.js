import fs from "fs"

export default {
  name: "setprefix",
  alias: ["setprefijo", "prefijo"],
  category: "admin",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid
    const newPrefix = args[0]

    if (!newPrefix) {
      return await sock.sendMessage(jid, {
        text: `❌ Usa así:\n#${"setprefix"}!\n#${"setprefix"} †\n#${"setprefix"}?\n\nPara poner varios: #setprefix!,?,†`
      }, { quoted: m })
    }

    // Soporta varios prefijos separados por coma:!,?,†
    const prefixes = newPrefix.split(",").map(p => p.trim()).filter(p => p.length > 0)

    const path = "./database/prefix.json"
    fs.writeFileSync(path, JSON.stringify({ prefixes }, null, 2))

    await sock.sendMessage(jid, {
      text: `╭━━━━━━━━━━━━━━⬣\n┃ ✅ *Prefijo cambiado*\n┃ ✦ Nuevo prefijo: ${prefixes.map(p=>`"${p}"`).join(", ")}\n╰━━━━━━━━━━━━━━⬣\n\n> Ahora usa ${prefixes[0]}menu`
    }, { quoted: m })
  }
}
