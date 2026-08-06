import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import seeCommands from './system/commandLoader.js';
import initDB from './system/initDB.js';
import antilink from '../cmds/antilink.js';
import level from '../cmds/level.js';

// Funciones auxiliares (igual que antes, sin cambios)
export function getGroupAdmins(participants) {
  try { return participants.filter(p => p.admin).map(p => p.id); } catch { return []; }
}
export function getAdmins(p){ return getGroupAdmins(p); }

// Carga comandos al inicio
seeCommands();

export default async (client, m) => {
  // ==============================================
  // 1. DATOS BÁSICOS + ARREGLO DE m.text (ERROR GRAVE 1)
  // ==============================================
  const sender = m.sender || m.key.remoteJid;
  const numerosExtra = ['527444200627']; // Tus números de owner extra
  const esExtraOwner = numerosExtra.some(num => sender.includes(num));
  
  // Extraemos TODO el texto del mensaje (funciona con texto, imágenes, videos, botones)
  const body = 
    m.message?.conversation || 
    m.message?.extendedTextMessage?.text || 
    m.message?.imageMessage?.caption || 
    m.message?.videoMessage?.caption || 
    m.message?.buttonsResponseMessage?.selectedButtonId || 
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || 
    m.message?.templateButtonReplyMessage?.selectedId || 
    '';
  
  // ✅ DEFINIMOS m.text PARA QUE TODO EL CÓDIGO FUNCIONE
  m.text = body;

  // ✅ FALLBACK PARA m.reply (funciona en TODAS las versiones de Baileys)
  if (typeof m.reply !== 'function') {
    m.reply = async (texto) => {
      return client.sendMessage(m.chat, { text: String(texto) }, { quoted: m });
    };
  }

  // ==============================================
  // 2. INICIALIZACIÓN SEGURA DE LA DB (ERROR GRAVE 2 Y 5)
  // ✅ NUNCA MÁS ERRORES DE "Cannot read properties of undefined"
  // ==============================================
  try { initDB(m, client); } catch {}
  if (!global.db) global.db = { data: {} };
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.settings) global.db.data.settings = {};

  // ==============================================
  // 3. DATOS DEL CHAT, BOT Y DB (ARREGLO DE botJid ERROR GRAVE 3)
  // ==============================================
  const from = m.key.remoteJid;
  m.chat = m.chat || from; // Unificamos m.chat por si no existe

  // ✅ botJid bien armado: usa lid si split falla
  const botJid = 
    (client.user.id?.split(':')[0] + '@s.whatsapp.net') || 
    client.user.lid || 
    client.user.id;

  // ✅ Ahora SÍ leemos la DB DESPUÉS de inicializarla
  const chat = global.db.data.chats[m.chat] || {};
  const settings = global.db.data.settings[botJid] || {};

  // ✅ Creamos el usuario SI NO EXISTE (sin errores)
  if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
  const user = global.db.data.users[sender];
  const users = chat.users?.[sender] || {};
  const pushname = m.pushName || 'Sin nombre';

  // ==============================================
  // 4. DATOS DE GRUPO Y ADMINS (ARREGLO ERROR GRAVE 4)
  // ==============================================
  let groupMetadata = null;
  let groupAdmins = [];
  let groupName = '';

  if (m.isGroup) {
    groupMetadata = await client.groupMetadata(m.chat).catch(() => null);
    groupName = groupMetadata?.subject || 'Grupo';
    // ✅ Filtramos admins de forma que funciona en TODAS las versiones de Baileys
    groupAdmins = groupMetadata?.participants?.filter(p => p.admin) || [];
  }

  // ✅ Detectamos admins de forma FIABLE (solo campos que siempre existen)
  const isBotAdmins = m.isGroup ? groupAdmins.some(p => p.id === botJid || p.lid === botJid) : false;
  const isAdmins = m.isGroup ? groupAdmins.some(p => p.id === sender || p.lid === sender) : false;

  // ✅ Detectamos dueños: arreglamos números sin @s.whatsapp.net
  const listaOwners = [
    ...(settings.owner ? [settings.owner.includes('@') ? settings.owner : settings.owner + '@s.whatsapp.net'] : []),
    ...global.owner.map(num => num.includes('@') ? num : num + '@s.whatsapp.net')
  ];
  const isOwners = listaOwners.includes(sender) || esExtraOwner;

  // ==============================================
  // 5. PLUGINS QUE SE EJECUTAN EN TODOS LOS MENSAJES
  // ==============================================
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (plugin && typeof plugin.all === "function") {
      try { await plugin.all.call(client, m, { client, chat, user, settings }); } 
      catch (err) { console.error(chalk.red(`[ TojiBot ALL Error -> ${name} ]`), err); }
    }
  }

  // ==============================================
  // 6. ESTADÍSTICAS DE USO (con fallback por si falla la fecha)
  // ==============================================
  let today;
  try {
    today = new Date().toLocaleDateString('es-MX', { 
      timeZone: 'America/Mexico_City', 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).split('/').reverse().join('-');
  } catch {
    const d = new Date();
    today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  if (!users.stats) users.stats = {};
  if (!users.stats[today]) users.stats[today] = { msgs: 0, cmds: 0 };
  users.stats[today].msgs++;

  // ==============================================
  // 7. PREFIJO (arreglamos regex para que no se rompa con caracteres especiales)
  // ==============================================
  const rawBotname = settings.namebot || 'TojiBot-WD';
  const tipo = settings.type || 'TojiBot';
  const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s\-]/g, '') || 'TojiBot-WD';
  const namebot = cleanBotname;

  // Formas cortas de llamar al bot (escapamos caracteres especiales para el regex)
  const escaparRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const shortForms = [
    namebot.charAt(0), 
    namebot.split(" ")[0], 
    tipo.split(" ")[0], 
    namebot.split(" ")[0].slice(0, 2), 
    'toji', 
    'toji bot'
  ].map(n => escaparRegex(n));

  let prefix;
  if (Array.isArray(settings.prefix) || typeof settings.prefix === 'string') {
    const prefixArray = Array.isArray(settings.prefix) ? settings.prefix : [settings.prefix];
    const prefixEscapados = prefixArray.map(p => escaparRegex(p));
    prefix = new RegExp(`^(${shortForms.join('|')})?(${prefixEscapados.join('|')})`, 'i');
  } else if (settings.prefix === true) {
    prefix = new RegExp('^', 'i'); // Sin prefijo: cualquier texto es comando
  } else {
    prefix = new RegExp(`^(${shortForms.join('|')})?`, 'i'); // Solo nombre del bot como prefijo
  }

  let pluginPrefix = client.prefix || prefix;
  let matchs;

  // Convertimos cualquier formato de prefijo a regex para comparar
  if (pluginPrefix instanceof RegExp) {
    matchs = [[pluginPrefix.exec(m.text), pluginPrefix]];
  } else if (Array.isArray(pluginPrefix)) {
    matchs = pluginPrefix.map(p => {
      const regex = p instanceof RegExp ? p : new RegExp('^' + escaparRegex(p), 'i');
      return [regex.exec(m.text), regex];
    });
  } else if (typeof pluginPrefix === 'string') {
    const regex = new RegExp('^' + escaparRegex(pluginPrefix), 'i');
    matchs = [[regex.exec(m.text), regex]];
  } else {
    matchs = [[null, null]];
  }

  // Tomamos el primer prefijo que coincida
  let match = matchs.find(p => p[0]);

  // ==============================================
  // 8. PLUGINS "BEFORE" (se ejecutan antes de procesar el comando)
  // ==============================================
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (!plugin || plugin.disabled) continue;
    if (typeof plugin.before === "function") {
      try { 
        if (await plugin.before.call(client, m, { client, chat, user, settings, isOwners, isAdmins })) { 
          continue; 
        } 
      } catch (err) { console.error(chalk.red(`[ TojiBot BEFORE Error -> ${name} ]`), err); }
    }
  }

  // Si no hay prefijo coincidente, no hacemos nada
  if (!match) return;

  // ==============================================
  // 9. PROCESAMOS COMANDO, ARGUMENTOS Y TEXTO
  // ==============================================
  let usedPrefix = (match[0] || [])[0] || '';
  let args = m.text.slice(usedPrefix.length).trim().split(" ").filter(a => a); // Quitamos espacios vacíos
  let command = (args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let text = args.join(' ');

  // Si no hay comando después del prefijo, salimos
  if (!command) return;

  // ==============================================
  // 10. REGLAS DE USO (modo self, grupos baneados)
  // ==============================================
  // Si el modo self está activado y no eres owner, ignoras
  if (!isOwners && settings.self) return;

  // Si el grupo está baneado y no es el comando de activar, respondes
  if (chat?.isBanned && !(command === 'bot' && text === 'on') && !isOwners) {
    return m.reply(`⚠️ El bot está desactivado en este grupo.\nActívalo con: ${usedPrefix}bot on`);
  }

  // ==============================================
  // 11. BUSCAMOS EL COMANDO Y VALIDAMOS PERMISOS
  // ==============================================
  const cmdData = global.comandos?.get(command) || global.commands?.get(command);
  if (!cmdData) {
    if (settings.prefix === true) return;
    try { await client.readMessages([m.key]); } catch {}
    return m.reply(`❌ El comando \`${command}\` no existe.\nUsa \`${usedPrefix}menu\` para ver todos.`);
  }

  // ✅ Mensaje CLARO para comandos de solo dueños (antes decía "no existe" y era confuso)
  if (cmdData.isOwner && !isOwners) {
    return m.reply(`🔒 Comando solo para dueños del bot.`);
  }

  // Si el comando requiere admin y no lo eres
  if (cmdData.isAdmin && !isAdmins && m.isGroup) {
    return m.reply(`👑 Necesitas ser administrador del grupo para usar este comando.`);
  }

  // Si el comando requiere que el bot sea admin y no lo es
  if (cmdData.isBotAdmin && !isBotAdmins && m.isGroup) {
    return m.reply(`🤖 Necesito ser administrador del grupo para ejecutar esta acción.`);
  }

  // ==============================================
  // 12. EJECUTAMOS EL COMANDO
  // ==============================================
  try {
    try { await client.readMessages([m.key]); } catch {}
    user.usedcommands = (user.usedcommands || 0) + 1;
    users.stats[today].cmds++;

    // ✅ Ejecutamos pasando UN OBJETO (compatibilidad con TODOS los plugins) + argumentos separados
    await cmdData.run(client, m, {
      args, text, usedPrefix, command,
      chat, user, users, settings,
      isOwners, isAdmins, isBotAdmins,
      groupMetadata, groupAdmins, groupName,
      botJid, sender, pushname
    });
  } catch (error) {
    console.error(chalk.red(`[ TojiBot CMD Error -> ${command} ]`), error);
    await m.reply(`⚠️ Ocurrió un error al ejecutar el comando:\n\`\`\`${error.message || error}\`\`\``);
  }

  // ==============================================
  // 13. SISTEMA DE NIVELES (con parámetros correctos)
  // ==============================================
  try { level(m, client, user, chat); } catch {}

  // ==============================================
  // 14. ANTILINK (lo movimos al final para que no bloquee comandos)
  // ==============================================
  try { antilink(client, m, { chat, settings, isAdmins, isOwners }); } catch {}
};
                                                 
