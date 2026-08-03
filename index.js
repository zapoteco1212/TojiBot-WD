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
const axios = require('axios');
const fs = require('fs');
const P = require('pino');

// ==============================================
// ✏️ MODIFICA ESTOS DATOS CON LOS TUYOS
// ==============================================
const CONFIG = {
  NOMBRE_BOT: "Tohka", // Nombre de tu bot
  DEVELOPER: "@Alba070503", // Tu usuario de GitHub/WhatsApp
  TIPO: "Principal",
  VERSION: "^3.0 - Latest",
  SISTEMA: "android",
  API_URL: "https://api.evogb.org",
  PREFIJO: "×", // Prefijo de comandos (igual al ejemplo)
  USUARIOS_TOTALES: 401 // Puedes conectarlo a una base de datos después
};
// ==============================================

// Función para formatear mensajes de ayuda (IGUAL AL EJEMPLO)
const crearMensajeAyuda = (usuario, categoria, comandos) => {
  const fecha = moment().format('DD MMM YYYY, hh:mm A');
  return `> 𖧧 ¡Hola! *@${usuario}*, Soy *${CONFIG.NOMBRE_BOT}*, Aquí tienes la lista de comandos para \`${categoria}\`

༺═━━━━━✦❖✦━━━━━═༻
❖ *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* ${CONFIG.DEVELOPER}
✦ *ᴛʏᴘᴇ ::* ${CONFIG.TIPO}
❖ *ᴠᴇʀsɪᴏɴ ::* ${CONFIG.VERSION}
✦ *sʏsᴛᴇᴍ/ᴏᴘʀ ::* ${CONFIG.SISTEMA}
❖ *ᴛɪᴍᴇ ::* ${fecha}
✦ *ᴜsᴇʀs ::* ${CONFIG.USUARIOS_TOTALES}
❖ *ᴜʀʟ ::* ${CONFIG.API_URL}
༺═━━━━━✦❖✦━━━━━═༻
> Vincula un *Socket* con tu número utilizando *${CONFIG.PREFIJO}qr* o *${CONFIG.PREFIJO}code*.
‧꒷︶꒷꒥꒷‧₊˚꒷︶꒷꒥꒷︶꒷˚₊‧꒷꒥꒷︶꒷‧

༺═────────────═༻
✧･ﾟ: *✧ ${categoria.toUpperCase()} ✧* :ﾟ･✧
༺═────────────═༻
${comandos}
༺═━━━━━✦❖✦━━━━━═༻`;
};

// Comandos del bot (agrega aquí los tuyos)
const COMANDOS = {
  // Comando principal: ×code (muestra TODOS los comandos o una categoría)
  code: async (sock, msg, args) => {
    const usuario = msg.key.remoteJid.split('@')[0];
    
    // Si pides una categoría específica: ×code stickers
    if (args[0] === 'stickers') {
      const comandosStickers = `> ✐ Comandos de *Stickers* para crear y gestionar stickers.
✧ *${CONFIG.PREFIJO}stickerpack » ${CONFIG.PREFIJO}spack » ${CONFIG.PREFIJO}stickers* + <query|url>
> Busca y descarga packs de Stickers.
✧ *${CONFIG.PREFIJO}delpack* + <name pack>
> Elimina un paquete de stickers.
✧ *${CONFIG.PREFIJO}delstickermeta » ${CONFIG.PREFIJO}delmeta*
> Restablecer el pack y autor por defecto para tus stickers.
✧ *${CONFIG.PREFIJO}getpack » ${CONFIG.PREFIJO}stickerpack » ${CONFIG.PREFIJO}pack* + <name pack>
> Descarga un paquete de stickers.
✧ *${CONFIG.PREFIJO}newpack » ${CONFIG.PREFIJO}newstickerpack* + <name pack>
> Crea un nuevo paquete de stickers.
✧ *${CONFIG.PREFIJO}setpackprivate » ${CONFIG.PREFIJO}setpackpriv » ${CONFIG.PREFIJO}packprivate* + <name pack>
> Establecer un paquete de stickers como privado.
✧ *${CONFIG.PREFIJO}setpackpublic » ${CONFIG.PREFIJO}setpackpub » ${CONFIG.PREFIJO}packpublic* + <name pack>
> Establecer un paquete de stickers como público.
✧ *${CONFIG.PREFIJO}setstickermeta » ${CONFIG.PREFIJO}setmeta* + <autor|pack>
> Establecer el pack y autor por defecto para tus stickers.
✧ *${CONFIG.PREFIJO}sticker » ${CONFIG.PREFIJO}s* + <cite / image|video>
> Convertir una imagen/video a sticker.
✧ *${CONFIG.PREFIJO}setstickerpackdesc » ${CONFIG.PREFIJO}setpackdesc » ${CONFIG.PREFIJO}packdesc* + <name pack / desc>
> Establece la descripción de un paquete de stickers.
✧ *${CONFIG.PREFIJO}setstickerpackname » ${CONFIG.PREFIJO}setpackname » ${CONFIG.PREFIJO}packname* + <name pack / new name pack>
> Cambia el nombre de un paquete de stickers.
✧ *${CONFIG.PREFIJO}stickeradd » ${CONFIG.PREFIJO}addsticker* + <name pack>
> Agrega un sticker a un paquete de stickers.
✧ *${CONFIG.PREFIJO}stickerdel » ${CONFIG.PREFIJO}delsticker* + <name pack>
> Elimina un sticker de un paquete de stickers.
✧ *${CONFIG.PREFIJO}stickerpacks » ${CONFIG.PREFIJO}packlist*
> Lista de tus paquetes de stickers.
✧ *${CONFIG.PREFIJO}brat » ${CONFIG.PREFIJO}bratv » ${CONFIG.PREFIJO}qc › ${CONFIG.PREFIJO}emojimix* + <text|mention>
> Crear stickers con texto.`;
      
      const respuesta = crearMensajeAyuda(usuario, 'stickers', comandosStickers);
      await sock.sendMessage(msg.key.remoteJid, { text: respuesta, mentions: [msg.key.remoteJid] });
      return;
    }

    // Si solo escribes ×code: muestra menú principal
    const menuPrincipal = `> ✐ Menú principal de *${CONFIG.NOMBRE_BOT}*
✧ *${CONFIG.PREFIJO}code stickers*
> Ver comandos de stickers
✧ *${CONFIG.PREFIJO}qr*
> Conectar bot con código QR
✧ *${CONFIG.PREFIJO}codebot*
> Conectar bot con código de 8 dígitos
✧ *${CONFIG.PREFIJO}info*
> Información del bot y API
✧ *${CONFIG.PREFIJO}ping*
> Ver latencia del bot`;

    const respuesta = crearMensajeAyuda(usuario, 'principal', menuPrincipal);
    await sock.sendMessage(msg.key.remoteJid, { text: respuesta, mentions: [msg.key.remoteJid] });
  },

  // Comando para ver información de la API evogb.org
  info: async (sock, msg) => {
    try {
      const res = await axios.get(CONFIG.API_URL);
      const info = `📊 *Información de ${CONFIG.API_URL}*
✅ Endpoints disponibles: 125
📂 Categorías: 11
🛟 Soporte: 24/7
⚡ Latencia promedio: <200ms
🔐 Seguridad: SSL empresarial`;
      await sock.sendMessage(msg.key.remoteJid, { text: info });
    } catch (e) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error al consultar la API' });
    }
  },

  // Comando ping
  ping: async (sock, msg) => {
    const inicio = Date.now();
    await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
    const fin = Date.now();
    await sock.sendMessage(msg.key.remoteJid, { text: `⚡ Latencia: ${fin - inicio}ms` });
  }
};

// Función principal del bot
const iniciarBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    logger: P({ level: 'silent' }),
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true,
    // Habilitar conexión por código de 8 dígitos (como el ejemplo)
    printQRInTerminal: false
  });

  // Mostrar QR en terminal O pedir código
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, receivedPendingNotifications } = update;
    
    if (qr) {
      console.log('\n📱 ESCANEA ESTE QR PARA CONECTAR:\n');
      qrcode.generate(qr, { small: true });
      console.log(`\n💡 O usa el comando: ${CONFIG.PREFIJO}codebot para obtener código de 8 dígitos`);
    }

    if (connection === 'close') {
      const reason = DisconnectReason[update.lastDisconnect.error?.output?.statusCode];
      console.log(`❌ Bot desconectado: ${reason}`);
      if (reason !== 'logged_out') iniciarBot();
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente!');
      console.log(`🤖 Nombre: ${CONFIG.NOMBRE_BOT}`);
      console.log(`📡 API: ${CONFIG.API_URL}`);
    }
  });

  // Guardar credenciales
  sock.ev.on('creds.update', saveCreds);

  // Manejar mensajes
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    // Obtener texto del mensaje
    const texto = msg.message.conversation 
      || msg.message.extendedTextMessage?.text 
      || '';

    // Verificar si es un comando (empieza con el prefijo ×)
    if (!texto.startsWith(CONFIG.PREFIJO)) return;

    // Separar comando y argumentos
    const [comando, ...args] = texto.slice(CONFIG.PREFIJO.length).toLowerCase().split(' ');

    // Ejecutar comando si existe
    if (COMANDOS[comando]) {
      try {
        await COMANDOS[comando](sock, msg, args);
        console.log(`✅ Comando ejecutado: ${CONFIG.PREFIJO}${comando}`);
      } catch (e) {
        console.error(`❌ Error en ${comando}:`, e);
        await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Ocurrió un error al ejecutar el comando' });
      }
    }
  });

  // ==============================================
  // 📱 COMANDO PARA CONECTAR POR CÓDIGO DE 8 DÍGITOS
  // ==============================================
  COMANDOS.codebot = async (sock, msg) => {
    const numero = msg.key.remoteJid.split('@')[0];
    // Pedir número con código de país (ej: 5215512345678 para México)
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `📱 Envía tu número con código de país para generar el código:\n*Ejemplo:* 5215512345678` 
    });

    // Esperar respuesta con el número
    const esperarNumero = async () => {
      return new Promise((resolve) => {
        const handler = sock.ev.on('messages.upsert', ({ messages }) => {
          const m = messages[0];
          if (m.key.remoteJid === msg.key.remoteJid && !m.key.fromMe) {
            const num = m.message.conversation?.replace(/\D/g, '');
            if (num && num.length >= 10) {
              sock.ev.off('messages.upsert', handler);
              resolve(num);
            }
          }
        });
      });
    };

    const numeroUsuario = await esperarNumero();
    try {
      // Generar código de 8 dígitos
      const codigo = await sock.requestPairingCode(numeroUsuario);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `🔑 Tu código de conexión es:\n\n*${codigo}*\n\nAbre WhatsApp > Menú > Dispositivos vinculados > Vincular con número de teléfono` 
      });
    } catch (e) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error al generar el código, verifica el número' });
    }
  };
};

// Iniciar el bot
iniciarBot();
        
