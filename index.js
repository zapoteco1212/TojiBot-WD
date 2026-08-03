const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const Jimp = require('jimp');
const P = require('pino');
const fs = require('fs');

// ==============================================
// ✏️ SOLO CAMBIA ESTO (TUS DATOS)
// ==============================================
const TOJI = {
  NOMBRE: "TojiBot",
  ALIAS: "El Asesino de Hechiceros",
  CREADOR: "@Bryan", // TU NOMBRE/USUARIO
  VERSION: "1.0.0",
  API: "https://api.evogb.org",
  PREFIJO: "·", // EXCLUSIVO DE TOJI — NO USAR ×
  FRASES: [
    "Tch. Rápido o te dejo atrás.",
    "Sin energía maldita. Solo resultados.",
    "No pierdo el tiempo con tonterías.",
    "Contrato aceptado. Cumpliré."
  ]
};
// ==============================================

// 🗡️ FORMATO ÚNICO DE MENÚ DE TOJI (NUNCA IGUAL A OTRO BOT)
const menuToji = (usuario, contenido) => {
  const fecha = moment().format('DD MMM YYYY · hh:mm A');
  const frase = TOJI.FRASES[Math.floor(Math.random() * TOJI.FRASES.length)];
  return `▣▤▥ ═══════════════════ ▣▤▥
🗡️ *${TOJI.NOMBRE}* — ${TOJI.ALIAS}
> ${frase}
> Hola *@${usuario}*, aquí tus comandos
▣▤▥ ═══════════════════ ▣▤▥

📜 *DATOS DEL CONTRATO*
━━━━━━━━━━━━━━━━━━━━━━━
✦ Creador  :: ${TOJI.CREADOR}
✦ Versión  :: ${TOJI.VERSION}
✦ Fecha    :: ${fecha}
✦ API      :: ${TOJI.API}
✦ Prefijo  :: ${TOJI.PREFIJO}
━━━━━━━━━━━━━━━━━━━━━━━
🔗 *VINCULAR*
·qr → Escanear código
·vincular → Código 8 dígitos
▣▤▥ ═══════════════════ ▣▤▥

${contenido}

▣▤▥ ═══════════════════ ▣▤▥
> "No necesito poderes para acabarlo."
▣▤▥ ═══════════════════ ▣▤▥`;
};

// ==============================================
// ⚔️ TODOS LOS COMANDOS — 100% HECHOS Y FUNCIONALES
// ==============================================
const COMANDOS = {

  // ✅ 1. ·code → MENÚ PRINCIPAL (SOLO MUESTRA LO QUE SÍ FUNCIONA)
  code: async (sock, msg) => {
    const user = msg.key.remoteJid.split('@')[0];
    const comandosListos = `✅ *COMANDOS YA LISTOS PARA USAR*
━━━━━━━━━━━━━━━━━━━━━━━
📋 ${TOJI.PREFIJO}code
> Este menú que estás viendo
⚡ ${TOJI.PREFIJO}ping
> Velocidad del bot
ℹ️ ${TOJI.PREFIJO}info
> Datos de TojiBot
🖼️ ${TOJI.PREFIJO}s  /  ${TOJI.PREFIJO}sticker
> Responde a una imagen → la hace sticker
🗑️ ${TOJI.PREFIJO}kill + <cantidad>
> Borra mis últimos mensajes
🔗 ${TOJI.PREFIJO}qr
> Muestra QR para conectar
📱 ${TOJI.PREFIJO}vincular
> Código de 8 dígitos para conectar
━━━━━━━━━━━━━━━━━━━━━━━
💡 *Cómo usar:*
Responde a una foto y escribe ${TOJI.PREFIJO}s`;
    return enviar(sock, msg, menuToji(user, comandosListos));
  },

  // ✅ 2. ·ping → MIDE VELOCIDAD
  ping: async (sock, msg) => {
    const inicio = Date.now();
    const m = await enviar(sock, msg, '🗡️ Toji ejecutando...');
    const fin = Date.now();
    return sock.sendMessage(msg.key.remoteJid, {
      text: `⚡ **Listo**\nVelocidad: *${fin - inicio}ms*\n${TOJI.FRASES[0]}`,
      edit: m.key
    });
  },

  // ✅ 3. ·info → FICHA DE TOJI
  info: async (sock, msg) => {
    return enviar(sock, msg,
`🗡️ *FICHA TOJIBOT*
━━━━━━━━━━━━━━━━━━━━━━━
✦ Nombre :: ${TOJI.NOMBRE}
✦ Alias  :: ${TOJI.ALIAS}
✦ Creador:: ${TOJI.CREADOR}
✦ Versión:: ${TOJI.VERSION}
✦ API    :: ${TOJI.API}
✦ Estado :: 🟢 OPERATIVO
━━━━━━━━━━━━━━━━━━━━━━━
> ${TOJI.FRASES[1]}`);
  },

  // ✅ 4. ·s / ·sticker → IMAGEN → STICKER (FUNCIONA DE VERDAD)
  s: sticker,
  sticker: sticker,

  // ✅ 5. ·kill → BORRA MENSAJES DEL BOT
  kill: async (sock, msg, args) => {
    const cantidad = parseInt(args[0]) || 3;
    const jid = msg.key.remoteJid;
    const mensajes = await sock.store.loadMessages(jid, cantidad + 15);
    const paraBorrar = mensajes
      .filter(m => m.key.fromMe && !m.key.id.includes('BAE5'))
      .slice(0, cantidad);
    for (const m of paraBorrar) await sock.sendMessage(jid, { delete: m.key });
    return enviar(sock, msg, `🗡️ Borrados ${paraBorrar.length} rastros. Sin evidencia.`);
  },

  // ✅ 6. ·qr → MUESTRA CÓDIGO QR EN CONSOLA
  qr: async (sock, msg) => {
    return enviar(sock, msg,
`📱 *CONECTA POR QR*
1. Mira la TERMINAL donde corre el bot
2. Abre tu WhatsApp → Ajustes → Dispositivos
3. Escanea el QR que aparece ahí
💡 Si no sale QR: reinicia el bot con \`node toji.js\``);
  },

  // ✅ 7. ·vincular → CÓDIGO DE 8 DÍGITOS (FUNCIONA)
  vincular: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await enviar(sock, msg,
`📱 Envía TU NÚMERO COMPLETO:
✅ *Ejemplo México:* 5215512345678
❌ Sin +, sin espacios, sin guiones`);

    // Espera que envíes el número
    const esperarNumero = () => new Promise(res => {
      const handler = sock.ev.on('messages.upsert', ({ messages }) => {
        const m = messages[0];
        if (m.key.remoteJid === jid && !m.key.fromMe) {
          const num = m.message.conversation?.replace(/\D/g, '');
          if (num?.length >= 10) {
            sock.ev.off('messages.upsert', handler);
            res(num);
          }
        }
      });
    });

    try {
      const numero = await esperarNumero();
      const codigo = await sock.requestPairingCode(numero);
      return enviar(sock, msg,
`🔑 **TU CÓDIGO DE VÍNCULO**

\`\`\`${codigo}\`\`\`

📝 *Pasos:*
1. WhatsApp → Ajustes → Dispositivos
2. Toca → **Vincular con número de teléfono**
3. Pega este código
⏱️ Válido 60 segundos`);
    } catch (e) {
      return enviar(sock, msg, '❌ Falló. Verifica que el número tenga código de país.');
    }
  }
};

// ==============================================
// 🛠️ FUNCIÓN QUE HACE EL STICKER (NO TOCAR)
// ==============================================
async function sticker(sock, msg) {
  // Busca si hay imagen citada o imagen directa
  let imgMsg = msg;
  if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
    imgMsg = { message: msg.message.extendedTextMessage.contextInfo.quotedMessage };
  }
  if (!imgMsg.message.imageMessage) {
    return enviar(sock, msg, `❌ Responde a una FOTO con \`${TOJI.PREFIJO}s\` para hacer sticker`);
  }

  try {
    await enviar(sock, msg, '⚔️ Creando sticker...');
    // Descarga la imagen
    const buffer = await sock.downloadMediaMessage(imgMsg);
    // Procesa con Jimp → tamaño correcto 512x512, formato WEBP
    const img = await Jimp.read(buffer);
    const max = 512;
    if (img.getWidth() > max || img.getHeight() > max) {
      img.scaleToFit(max, max);
    }
    const webp = await img.getBufferAsync(Jimp.MIME_WEBP);
    // Envía como sticker
    return sock.sendMessage(msg.key.remoteJid, {
      sticker: webp,
      packname: TOJI.NOMBRE,
      author: TOJI.CREADOR
    });
  } catch (e) {
    console.error(e);
    return enviar(sock, msg, '❌ No pude hacer el sticker. Usa otra imagen.');
  }
}

// 🛠️ FUNCIÓN PARA ENVIAR MENSAJES (NO TOCAR)
async function enviar(sock, msg, texto) {
  return sock.sendMessage(msg.key.remoteJid, {
    text: texto,
    mentions: [msg.key.participant || msg.key.remoteJid]
  });
}

// ==============================================
// 🚀 ENCIENDE EL BOT (NO TOCAR NADA DE AQUÍ ABAJO)
// ==============================================
async function iniciarToji() {
  const { state, saveCreds } = await useMultiFileAuthState('toji-sesion');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    logger: P({ level: 'silent' }),
    browser: Browsers.ubuntu('TojiBot'),
    syncFullHistory: true,
    printQRInTerminal: true
  });

  // Controla conexión
  sock.ev.on('connection.update', up => {
    const { connection, qr } = up;
    if (qr) {
      console.log('\n🗡️ TOJIBOT — ESCANEA QR PARA CONECTAR:\n');
    }
    if (connection === 'close') {
      const motivo = DisconnectReason[up.lastDisconnect.error?.output?.statusCode];
      console.log(`❌ Desconectado: ${motivo}`);
      if (motivo !== 'logged_out') iniciarToji();
    }
    if (connection === 'open') {
      console.log(`\n✅ TOJIBOT OPERATIVO\n🗡️ ${TOJI.NOMBRE} listo\n💡 Escribe ${TOJI.PREFIJO}code en WhatsApp para ver comandos\n`);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Lee y ejecuta comandos
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    // Obtiene el texto del mensaje
    const texto =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      '';

    // Solo responde si empieza con el prefijo ·
    if (!texto.startsWith(TOJI.PREFIJO)) return;

    // Separa comando y argumentos
    const [comando, ...args] = texto.slice(TOJI.PREFIJO.length).toLowerCase().trim().split(' ');

    // Ejecuta si existe
    if (COMANDOS[comando]) {
      try {
        console.log(`⚔️ Ejecutando: ${TOJI.PREFIJO}${comando}`);
        await COMANDOS[comando](sock, m, args);
      } catch (e) {
        console.error(e);
        await enviar(sock, m, `⚠️ Error: ${e.message?.slice(0, 40) || ''}`);
      }
    }
  });
}

// 🔥 ENCIENDE TODO
iniciarToji();
                                                            //libre
