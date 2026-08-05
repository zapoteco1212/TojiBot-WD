import { prefixes, updatePrefixes } from "../../prefix.js"

export default {
  name: "setprefix",
  alias: ["setprefijo", "prefijo", "setp"],
  category: "admin",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid
    if (!args[0]) {
      return await sock.sendMessage(jid, {
        text: `╭━━━〔 ⚙️ PREFIJO ACTUAL 〕━━━⬣
┃ Actual: ${prefixes.map(p=>`"${p}"`).join(", ")}
┃
┃ Usa: #setprefix!
┃ Usa: #setprefix †
┃ Usa: #setprefix!,?,†,.,-
╰━━━━━━━━━━━━━━━━━━⬣`
      }, { quoted: m })
    }

    const newPrefixes = args[0].split(",").map(p => p.trim()).filter(p => p)

    if (newPrefixes.length === 0) return

    updatePrefixes(newPrefixes)

    await sock.sendMessage(jid, {
      text: `✅ Prefijo cambiado a: ${newPrefixes.map(p=>`"${p}"`).join(", ")}\n\nPrueba: ${newPrefixes[0]}menu`
    }, { quoted: m })
  }
}
