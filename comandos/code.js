mkdir -p core Sessions/Subs

cat > core/subs.js <<'EOF'
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
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
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
  } else {
    subSock.ev.on("connection.update", async (update) => {
      const { qr } = update
      if (qr) {
        await sock.sendMessage(chatId, { text: caption }, { quoted: m })
        // Aquí podrías mandar el QR como imagen si quieres
      }
    })
  }

  subSock.ev.on("connection.update", async (update) => {
    if (update.connection === "open") {
      await sock.sendMessage(chatId, { text: `✅ Sub-Bot ${id} conectado con éxito` }, { quoted: m })
    }
  })
}
EOF

cat > comandos/code.js <<'EOF'
import { startSubBot } from "../core/subs.js"
import fs from "fs"
import path from "path"

let lastUsed = {}

export default {
  name: "code",
  category: "socket",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const args = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").split(" ").slice(1)

    if (lastUsed[m.sender] && Date.now() - lastUsed[m.sender] < 120000) {
      const wait = Math.ceil((120000 - (Date.now() - lastUsed[m.sender])) / 1000)
      await sock.sendMessage(jid, { text: `😔 Debes esperar ${wait}s para volver a intentar` }, { quoted: m })
      return
    }

    const phone = args[0]?.replace(/\D/g, '') || m.sender.split("@")[0]
    const caption = "`✤` Vincula tu *cuenta* usando el *codigo.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Dispositivos vinculados\n*›* Vincular nuevo dispositivo\n*›* Vincular con número\n\nTu número: ${phone}"

    await startSubBot(m, sock, caption, true, phone, jid, {}, true)
    lastUsed[m.sender] = Date.now()
  }
}
EOF

cat > comandos/qr.js <<'EOF'
import { startSubBot } from "../core/subs.js"
export default {
  name: "qr",
  category: "socket",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const caption = "`✤` Vincula con QR\n\n> 3 puntos > Dispositivos vinculados > Vincular dispositivo > Escanea el QR"
    const phone = m.sender.split("@")[0]
    await startSubBot(m, sock, caption, false, phone, jid, {}, true)
  }
}
EOF

node index.js
