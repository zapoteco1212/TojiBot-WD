import makeWASocket, { useMultiFileAuthState, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"
import path from "path"

export async function startSubBot(m, sock, caption, isCode, phoneNumber, chatId, commandFlags, isCommand) {
  const id = phoneNumber.replace(/\D/g, '')
  const sessionPath = path.join(process.cwd(), "Sessions", "Subs", id)
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const subSock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
    browser: ["TojiBot Sub", "Chrome", "1.0"]
  })
  subSock.ev.on("creds.update", saveCreds)
  if (isCode) {
    await new Promise(r => setTimeout(r, 2000))
    if (!subSock.authState.creds.registered) {
      try {
        let code = await subSock.requestPairingCode(id)
        code = code?.match(/.{1,4}/g)?.join("-") || code
        await sock.sendMessage(chatId, { text: `${caption}\n\n*Tu código es:* ${code}` }, { quoted: m })
      } catch (e) {
        await sock.sendMessage(chatId, { text: "Error al generar código: " + e.message }, { quoted: m })
      }
    }
  }
  subSock.ev.on("connection.update", async (update) => {
    if (update.connection === "open") {
      await sock.sendMessage(chatId, { text: `✅ Sub-Bot ${id} conectado` }, { quoted: m })
    }
  })
}
