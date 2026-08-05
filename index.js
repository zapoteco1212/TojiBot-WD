import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { prefixes } from "./prefix.js"
import qrcode from "qrcode-terminal"
import pino from "pino"
import { execSync } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const comandos = new Map()

function getAllJsFiles(dir) {
  let files = []
  if (!fs.existsSync(dir)) return files
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item)
    if (fs.statSync(full).isDirectory()) files = files.concat(getAllJsFiles(full))
    else if (item.endsWith(".js")) files.push(full)
  }
  return files
}

async function loadComandos() {
  comandos.clear()
  const dir = path.join(__dirname, "comandos")
  const files = getAllJsFiles(dir)
  for (const file of files) {
    try {
      const mod = await import(`${file}?update=${Date.now()}`)
      const cmd = mod.default
      if (!cmd?.name || typeof cmd.execute !== "function") continue
      comandos.set(cmd.name, cmd)
      // también guarda alias
      if (cmd.alias) {
        for (const al of cmd.alias) comandos.set(al, cmd)
      }
      console.log(`✅ Cargado: ${cmd.name} [${path.basename(path.dirname(file))}]`)
    } catch (e) {
      console.log(`❌ ${path.basename(file)}:`, e.message)
    }
  }
}

async function start() {
  await loadComandos()
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }) })
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", async (u) => {
    const { connection, lastDisconnect, qr } = u
    if (qr) {
      console.log("\n\n=== ESCANEA ESTE QR ===\n")
      qrcode.generate(qr, { small: true })
    }
    if (connection === "close") {
      const code = lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output.statusCode : 0
      if (code !== DisconnectReason.loggedOut) start()
    } else if (connection === "open") console.log("¡Bot conectado! 🚀")
  })
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const usedPrefix = prefixes.find(p => text.startsWith(p))
    if (!usedPrefix) return
    
    let args = text.slice(usedPrefix.length).trim().split(/ +/)
    let cmdName = args.shift()?.toLowerCase()
    if (!cmdName) return

    // PARCHE: para que jale #setprefix† sin espacio
    if (cmdName.startsWith("setprefix") && cmdName !== "setprefix") {
      const extra = cmdName.slice("setprefix".length)
      if (extra) args.unshift(extra)
      cmdName = "setprefix"
    }
    if (cmdName.startsWith("setprefijo") && cmdName !== "setprefijo") {
      const extra = cmdName.slice("setprefijo".length)
      if (extra) args.unshift(extra)
      cmdName = "setprefijo"
    }
    if (cmdName.startsWith("prefijo") && cmdName !== "prefijo") {
      const extra = cmdName.slice("prefijo".length)
      if (extra) args.unshift(extra)
      cmdName = "prefijo"
    }

    if (cmdName === "fix") {
      await sock.sendMessage(m.key.remoteJid, { text: "🔄 Actualizando..." }, { quoted: m })
      try { execSync("git stash && git pull origin main", { stdio: "inherit" }); await loadComandos(); await sock.sendMessage(m.key.remoteJid, { text: "✅ Actualizado" }, { quoted: m }) } catch (e) { await sock.sendMessage(m.key.remoteJid, { text: `❌ ${e.message}` }, { quoted: m }) }
      return
    }
    const cmd = comandos.get(cmdName)
    if (!cmd) return
    try { await cmd.execute(sock, m, args) } catch (e) { console.log(e) }
  })
}
start()
