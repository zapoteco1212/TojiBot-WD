import { Browsers, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

export default {
  command: ['newowner', 'setnewowner', 'botprincipal', 'rescueowner', 'tojirescue'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, args, usedPrefix, command) => {
    const numero = args[0];

    if (!numero) {
      return m.reply(`《⚔️》 *TojiBot-WD | Cambio de Principal*\n\nIngresa el número que será el nuevo Bot Principal.\n> Ejemplo: *${usedPrefix + command} 527444317595*`);
    }

    const cleanNumber = numero.replace(/\D/g, '');
    await m.reply(`⏳ *PROTOCOLO TOJI: RESCATE INICIADO...*\n\nGenerando código de vinculación para *+${cleanNumber}*.\n\n> ⚠️ *ADVERTENCIA:* La sesión actual de *TojiBot-WD* será eliminada permanentemente para cederle el control al nuevo número.`);

    // Carpeta principal de TojiBot-WD
    const ownerSessionPath = path.resolve('./Session');

    try {
      if (fs.existsSync(ownerSessionPath)) {
        fs.rmSync(ownerSessionPath, { recursive: true, force: true });
      }
      fs.mkdirSync(ownerSessionPath, { recursive: true });
    } catch (e) {
      return m.reply('❌ *TojiBot-WD* no pudo limpiar la sesión anterior.\n' + e.message);
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(ownerSessionPath);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('TojiBot-WD'),
        auth: state,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        getMessage: async () => "",
        version
      });

      sock.isInit = false;
      sock.ev.on('creds.update', saveCreds);

      setTimeout(async () => {
        try {
          if (!sock.authState.creds.registered) {
            let codeGen = await sock.requestPairingCode(cleanNumber);
            codeGen = codeGen?.match(/.{1,4}/g)?.join("-") || codeGen;

            await m.reply(`「⚔️」 *TOJIBOT-WD - NUEVO PRINCIPAL* 「⚔️」\n\n> ➭ *Número:* +${cleanNumber}\n> ➭ *Código:* *${codeGen}*\n\n_Ve a WhatsApp > Dispositivos vinculados > Vincular con número_\n_Ingresa este código en el nuevo WhatsApp._\n\n_TojiBot-WD te avisará aquí cuando se conecte._`);
          }
        } catch (err) {
          console.error("[TojiBot Código Error]", err);
          m.reply(`❌ Error al solicitar el código Toji: ${err.message}`);
        }
      }, 3000);

      sock.ev.on('connection.update', async (update) => {
        const { connection } = update;

        if (connection === 'open') {
          await m.reply(`✅ *¡TOJI DOMINÓ LA SESIÓN!*\n\nEl número +${cleanNumber} ahora es el nuevo Bot Principal de *TojiBot-WD*.\n\n🔄 *Reiniciando sistema en 5 segundos...*\n> By zapoteco1212`);

          setTimeout(() => {
            process.exit(1);
          }, 5000);
        }
      });

    } catch (error) {
      console.error(error);
      await m.reply(`> ❌ Error inesperado en TojiBot-WD.\n> [Error: *${error.message}*]`);
    }
  }
};
