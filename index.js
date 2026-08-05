import "./settings.js";
import main from './main.js';
import events from './cmds/events.js';
import { Browsers, makeWASocket, makeCacheableSignalKeyStore, useMultiFileAuthState, fetchLatestBaileysVersion, jidDecode, DisconnectReason } from "@whiskeysockets/baileys";
import cfonts from 'cfonts';
import pino from "pino";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import { smsg } from "./core/message.js";
import { startModBot } from './core/mods.js';
import { startPremBot } from './core/prems.js';
import { startSubBot } from './core/subs.js';
import { exec } from "child_process";

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(`INFO`), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(`SUCCESS`), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellowBright.blueBright.bold(`WARNING`), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(`ERROR`), chalk.redBright(msg))
};

let phoneNumber = global.botNumber || "";
const methodCodeQR = process.argv.includes("--qr");
const methodCode = process.argv.includes("code");
const DIGITS = (s = "") => String(s).replace(/\D/g, "");
function normalizePhoneForPairing(input) {
  let s = DIGITS(input);
  if (!s) return "";
  if (s.startsWith("0")) s = s.replace(/^0+/, "");
  return s;
}

const { say } = cfonts
console.log(chalk.greenBright('\n⚔️ Iniciando TojiBot-WD...'))
say('TojiBot', { align: 'center', gradient: ['green', 'cyan'] })
say('WD Edition by zapoteco1212', { font: 'console', align: 'center', gradient: ['cyan', 'green'] })

const botTypes = [
  { name: 'ModBot', folder: './Sessions/Mods', starter: startModBot },
  { name: 'PremBot', folder: './Sessions/Prems', starter: startPremBot },
  { name: 'SubBot', folder: './Sessions/Subs', starter: startSubBot }
];

if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
global.conns = global.conns || [];
const reconnecting = new Set();

async function loadBots() {
  for (const { name, folder, starter } of botTypes) {
    if (!fs.existsSync(folder)) continue;
    const botIds = fs.readdirSync(folder);
    for (const userId of botIds) {
      const sessionPath = path.join(folder, userId);
      const credsPath = path.join(sessionPath, 'creds.json');
      if (!fs.existsSync(credsPath)) continue;
      if (global.conns.some((conn) => conn.userId === userId)) continue;
      if (reconnecting.has(userId)) continue;
      try {
        reconnecting.add(userId);
        await starter(null, null, 'Auto reconexión', false, userId, sessionPath);
      } catch (e) {
        console.log(chalk.gray(`[ TojiBot ] Error ${name} ${userId}: ${e?.message || e}`));
      } finally {
        reconnecting.delete(userId);
      }
      await new Promise((res) => setTimeout(res, 2500));
    }
  }
  setTimeout(loadBots, 60 * 1000);
}

let opcion;
if (methodCodeQR) opcion = "1";
else if (methodCode) opcion = "2";
else if (!fs.existsSync("./Sessions/Owner/creds.json")) {
  opcion = readlineSync.question(chalk.bold.white("\n⚔️ TojiBot-WD - Seleccione:\n") + chalk.greenBright("1. Con código QR\n") + chalk.cyan("2. Con código de 8 dígitos\n--> "));
  while (!/^[1-2]$/.test(opcion)) {
    console.log(chalk.bold.redBright(`Solo 1 o 2`));
    opcion = readlineSync.question("--> ");
  }
  if (opcion === "2") {
    console.log(chalk.bold.greenBright(`\nIngresa tu número TojiBot-WD\nEjemplo: 527444200627\n---> `));
    let phoneInput = readlineSync.question("");
    phoneNumber = normalizePhoneForPairing(phoneInput);
  }
}

let reconexion = 0;
const intentos = 15;
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName);
  const { version } = await fetchLatestBaileysVersion();
  const logger = pino({ level: "silent" });
  const sock = makeWASocket({
    version, logger, printQRInTerminal: false,
    browser: Browsers.macOS('Safari'),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => "",
  });
  global.client = sock;
  sock.isInit = false;
  sock.ev.on("creds.update", saveCreds);

  if (opcion === "2" && !fs.existsSync("./Sessions/Owner/creds.json")) {
    setTimeout(async () => {
      try {
        if (!state.creds.registered) {
          const pairing = await global.client.requestPairingCode(phoneNumber);
          const codeBot = pairing?.match(/.{1,4}/g)?.join("-") || pairing;
          console.log(chalk.bold.white(chalk.bgGreen(` TojiBot Código: `)), chalk.bold.white(codeBot));
        }
      } catch (err) {
        console.log(chalk.red("Error TojiBot código:"), err);
      }
    }, 3000);
  }

  sock.sendText = (jid, text, quoted = "", options) => sock.sendMessage(jid, { text, ...options }, { quoted });
  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr && (opcion == '1' || methodCodeQR)) {
      console.log(chalk.green.bold("[ TojiBot-WD ] Escanea QR"));
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;
      if (reason === DisconnectReason.loggedOut) {
        exec("rm -rf ./Sessions/Owner/*"); process.exit(1);
      } else {
        reconexion++;
        if (reconexion > intentos) process.exit(1);
        const delay = Math.min(3000 * reconexion, 30000);
        console.log(chalk.yellow(`Desconexión ${reason}, reconectando en ${delay/1000}s`));
        setTimeout(startBot, delay);
      }
    }
    if (connection === "open") {
      reconexion = 0;
      console.log(chalk.green.bold(`[ ⚔️ TojiBot-WD Conectado: ${sock.user.name || 'TojiBot'} ]`));
    }
  });

  sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const kay = chatUpdate.messages[0];
      if (!kay?.message) return;
      if (kay.key?.remoteJid === 'status@broadcast') return;
      kay.message = Object.keys(kay.message)[0] === 'ephemeralMessage' ? kay.message.ephemeralMessage.message : kay.message;
      const m = await smsg(sock, kay);
      main(sock, m, chatUpdate);
    } catch (err) { console.log(err); }
  });
  try { await events(sock, null); } catch (err) { console.log(chalk.gray(`[ TojiBot ] → ${err}`)); }
  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    }
    return jid;
  };
}

(async () => { await loadBots(); })();
(async () => {
  global.loadDatabase()
  console.log(chalk.gray('[ TojiBot-WD ] DB cargada.'))
  await startBot();
})();
