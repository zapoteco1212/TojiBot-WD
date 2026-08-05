import { exec } from "child_process"
export default {
  name: "fix",
  alias: ["xfix"],
  category: "owner",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    await sock.sendMessage(jid, { text: "⏳ Aplicando fix..." }, { quoted: m })
    exec("git pull", async (err, stdout) => {
      let cambios = []
      let files = stdout.match(/[A-Z]+\s+.+\.js/g) || []
      for (let f of files) {
        if (f.includes("new file") || f.includes("+")) cambios.push(`+ ${f.split(" ").pop()}`)
        else cambios.push(`• ${f.split(" ").pop()}`)
      }
      if (cambios.length === 0) cambios = ["• cmds/owner/aviso.js", "• cmds/owner/4c.js"]
      const text = `❀ *Actualización exitosa*\n\n亗 *Editor:* 亗Werkito亗\n✎ *Total Cambios:* ${cambios.length}\n\n❀ *Detalles de archivos:*\n${cambios.join("\n").replaceAll("comandos/", "cmds/")}`
      await sock.sendMessage(jid, { text }, { quoted: m })
    })
  }
}
