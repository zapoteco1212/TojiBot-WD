import { exec } from "child_process"
import fs from "fs"

export default {
  name: "fix",
  alias: ["xfix", "actualizar"],
  category: "owner",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const id = m.key.participant || m.key.remoteJid
    const EDITOR_FIJO = "亗Werkito亗"

    await sock.sendMessage(jid, { text: "⏳ *Aplicando cambios...*" }, { quoted: m })

    exec("git pull && git status --porcelain", async (err, stdout) => {
      if (err) {
        return await sock.sendMessage(jid, { text: `❌ Error:\n${err.message}` }, { quoted: m })
      }

      let cambios = []
      const lines = stdout.split("\n").filter(v => v.trim()!== "")
      
      for (let line of lines) {
        let file = line.slice(3).trim()
        if (!file.endsWith(".js")) continue
        if (line.startsWith("A") || line.startsWith("?")) cambios.push(`+ ${file}`)
        else cambios.push(`• ${file}`)
      }

      if (cambios.length === 0) cambios = ["• Sin cambios nuevos"]
      
      cambios = [...new Set(cambios)]
      const total = cambios.length
      const detalle = cambios.join("\n").replace(/comandos\//g, "cmds/owner/").replace(/owner\//g, "cmds/owner/")

      const text = `❀ *Actualización exitosa*\n\n亗 *Editor:* ${EDITOR_FIJO}\n✎ *Total Cambios:* ${total}\n\n❀ *Detalles de archivos:*\n${detalle}`

      await sock.sendMessage(jid, { text }, { quoted: m })
    })
  }
}
