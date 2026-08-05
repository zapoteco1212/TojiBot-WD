mkdir -p cmds core/system
printf 'export default function(){};\n' > cmds/antilink.js
printf 'export default function(){};\n' > cmds/level.js
printf 'export default function(){};\n' > core/system/initDB.js
printf 'global.comandos=new Map();global.plugins={};\nasync function seeCommands(){}\nexport default seeCommands;\nexport { seeCommands };\n' > core/system/commandLoader.js

cat > main.js <<'ENDMAIN'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'readline';
import messageHandler from './core/message.js';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (t) => new Promise((r) => rl.question(t, r));
async function start(){
 console.log('\n=== TojiBot-WD ===\n1. QR\n2. CODIGO 8 DIGITOS\n');
 let method = await question('Elige 1 o 2: ');
 method = method.trim();
 const { state, saveCreds } = await useMultiFileAuthState('sessions');
 global.db = { data: { chats: {}, settings: {}, users: {} } };
 global.owner = ['527444200627'];
 const sock = makeWASocket({
  logger: pino({ level: 'silent' }),
  printQRInTerminal: method==='1',
  auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
  browser: ['TojiBot-WD','Chrome','1.0.0']
 });
 if(method==='2'){
  let num = await question('Numero con codigo pais sin + ej 5219999999999: ');
  num = num.replace(/[^0-9]/g,'');
  console.log('Generando codigo...');
  await new Promise(r=>setTimeout(r,2000));
  try {
   const code = await sock.requestPairingCode(num);
   console.log('\n==== TU CODIGO: '+code+' ====\nWhatsApp > Dispositivos vinculados > Vincular con numero');
  } catch(e){ console.log('Error:', e.message); }
 }
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', async (u)=>{
  const { connection, lastDisconnect } = u;
  if(connection==='close'){
   const rec = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
   if(rec) start();
  } else if(connection==='open'){
   console.log('\n*** CONECTADO ***');
  }
 });
 sock.ev.on('messages.upsert', async (m)=>{
  try { await messageHandler(sock, m.messages[0]); } catch(e){ console.log(e); }
 });
}
start();
ENDMAIN

node main.js
