cd ~/TojiBot-WD
rm main.js
cat > main.js << 'EOF'
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

export function getGroupAdmins(participants) {
  try { return participants.filter(p => p.admin).map(p => p.id); } catch { return []; }
}
export function getAdmins(p){ return getGroupAdmins(p); }

seeCommands();

export default async (client, m) => {
  const sender = m.sender || m.key.remoteJid;
  const numerosExtra = ['527444200627'];
  const esExtraOwner = numerosExtra.some(num => sender.includes(num));

  const body =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.message?.templateButtonReplyMessage?.selectedId ||
    '';

  m.text = body;

  if (typeof m.reply!== 'function') {
    m.reply = async (texto) => {
      return client.sendMessage(m.chat, { text: String(texto) }, { quoted: m });
    };
  }

  try { initDB(m, client); } catch {}
  if (!global.db) global.db = { data: {} };
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.settings) global.db.data.settings = {};

  const from = m.key.remoteJid;
  m.chat = m.chat || from;

  const botJid =
    (client.user.id?.split(':')[0] + '@s.whatsapp.net') ||
    client.user.lid ||
    client.user.id;

  const chat = global.db.data.chats[m.chat] || {};
  const settings = global.db.data.settings[botJid] || {};

  if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
  const user = global.db.data.users[sender];
  const users = chat.users?.[sender] || {};
  const pushname = m.pushName || 'Sin nombre';

  let groupMetadata = null;
  let groupAdmins = [];
  let groupName = '';

  if (m.isGroup) {
    groupMetadata = await client.groupMetadata(m.chat).catch(() => null);
    groupName = groupMetadata?.subject || 'Grupo';
    groupAdmins = groupMetadata?.participants?.filter(p => p.admin) || [];
  }

  const isBotAdmins = m.isGroup? groupAdmins.some(p => p.id === botJid || p.lid === botJid) : false;
  const isAdmins = m.isGroup? groupAdmins.some(p => p.id === sender || p.lid === sender) : false;

  const listaOwners = [
   ...(settings.owner? [settings.owner.includes('@')? settings.owner : settings.owner + '@s.whatsapp.net'] : []),
   ...global.owner.map(num => num.includes('@')? num : num + '@s.whatsapp.net')
  ];
  const isOwners = listaOwners.includes(sender) || esExtraOwner;

  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (plugin && typeof plugin.all === "function") {
      try { await plugin.all.call(client, m, { client, chat, user, settings }); }
      catch (err) { console.error(chalk.red(`[ TojiBot ALL Error -> ${name} ]`), err); }
    }
  }

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

  const rawBotname = settings.namebot || 'TojiBot-WD';
  const tipo = settings.type || 'TojiBot';
  const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s\-]/g, '') || 'TojiBot-WD';
  const namebot = cleanBotname;

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
    const prefixArray = Array.isArray(settings.prefix)? settings.prefix : [settings.prefix];
    const prefixEscapados = prefixArray.map(p => escaparRegex(p));
    prefix = new RegExp(`^(${shortForms.join('|')})?(${prefixEscapados.join('|')})`, 'i');
  } else if (settings.prefix === true) {
    prefix = new RegExp('^', 'i');
  } else {
    prefix = new RegExp(`^(${shortForms.join('|')})?`, 'i');
  }

  let pluginPrefix = client.prefix || prefix;
  let matchs;

  if (pluginPrefix instanceof RegExp) {
    matchs = [[pluginPrefix.exec(m.text), pluginPrefix]];
  } else if (Array.isArray(pluginPrefix)) {
    matchs = pluginPrefix.map(p => {
      const regex = p instanceof RegExp? p : new RegExp('^' + escaparRegex(p), 'i');
      return [regex.exec(m.text), regex];
    });
  } else if (typeof pluginPrefix === 'string') {
    const regex = new RegExp('^' + escaparRegex(pluginPrefix), 'i');
    matchs = [[regex.exec(m.text), regex]];
  } else {
    matchs = [[null, null]];
  }

  let match = matchs.find(p => p[0]);

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

  if (!match) return;

  let usedPrefix = (match[0] || [])[0] || '';
  let args = m.text.slice(usedPrefix.length).trim().split(" ").filter(a => a);
  let command = (args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let text = args.join(' ');

  if (!command) return;

  if (!isOwners && settings.self) return;

  if (chat?.isBanned &&!(command === 'bot' && text === 'on') &&!isOwners) {
    return m.reply(`El bot esta desactivado en este grupo.\nActivalo con: ${usedPrefix}bot on`);
  }

  const cmdData = global.comandos?.get(command) || global.commands?.get(command);
  if (!cmdData) {
    if (settings.prefix === true) return;
    try { await client.readMessages([m.key]); } catch {}
    return m.reply(`El comando ${command} no existe.\nUsa ${usedPrefix}menu para ver todos.`);
  }

  if (cmdData.isOwner &&!isOwners) {
    return m.reply(`Comando solo para duenos del bot.`);
  }

  if (cmdData.isAdmin &&!isAdmins && m.isGroup) {
    return m.reply(`Necesitas ser administrador del grupo para usar este comando.`);
  }

  if (cmdData.isBotAdmin &&!isBotAdmins && m.isGroup) {
    return m.reply(`Necesito ser administrador del grupo para ejecutar esta accion.`);
  }

  try {
    try { await client.readMessages([m.key]); } catch {}
    user.usedcommands = (user.usedcommands || 0) + 1;
    users.stats[today].cmds++;

    await cmdData.run(client, m, {
      args, text, usedPrefix, command,
      chat, user, users, settings,
      isOwners, isAdmins, isBotAdmins,
      groupMetadata, groupAdmins, groupName,
      botJid, sender, pushname
    });
  } catch (error) {
    console.error(chalk.red(`[ TojiBot CMD Error -> ${command} ]`), error);
    await m.reply(`Ocurrio un error al ejecutar el comando:\n${error.message || error}`);
  }

  try { level(m, client, user, chat); } catch {}
  try { antilink(client, m, { chat, settings, isAdmins, isOwners }); } catch {}
};
EOF
