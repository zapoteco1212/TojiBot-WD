import { prefixes, updatePrefixes } from "../prefix.js"
import fs from "fs"

export default {
  name: "setprefix",
  alias: ["setprefijo", "prefijo"],
  async execute(sock, m, args) {
    const jid = m.key.remoteJid
    let newPrefix = args[0]

    if (!newPrefix) {
      return await sock.sendMessage(jid, { text: `✳️ Prefijo actual: ${prefixes.join(", ")}\n\nUso: ${prefixes[0]}setprefix + tu nuevo prefijo\nEj: ${prefixes[0]}setprefix †` }, { quoted: m })
    }

    newPrefix = newPrefix.trim()
    if (newPrefix.length > 3) {
      return await sock.sendMessage(jid, { text: `❌ El prefijo es muy largo, max 3 caracteres` }, { quoted: m })
    }

    updatePrefixes([newPrefix])

    await sock.sendMessage(jid, { text: `✅ Prefijo cambiado a: ${newPrefix}\n\nAhora usa por ejemplo: ${newPrefix}menu` }, { quoted: m })
  }
}
