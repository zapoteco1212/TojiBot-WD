cd ~/TojiBot-WD
cat > core/message.js <<'ENDOFFILE'
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
  const sender = m.sender;
  const numerosExtra = ['527444200627'];
  const esExtraOwner = numerosExtra.some(num => sender.includes(num));
  let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.message.templateButtonReplyMessage?.selectedId || '';
  try { initDB(m, client) } catch {}
  try { antilink(client, m); } catch {}
  const from = m.key.remoteJid;
  const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.lid;
  const chat = global.db?.data?.chats[m.chat] || {}
  const settings = global.db?.data?.settings[botJid] || {}
  const user = global.db?.data?.users[sender] ||= {}
  const users = chat.users?.[sender] || {}
  const pushname = m.pushName || 'Sin nombre';
  let groupMetadata = null
  let groupAdmins = []
  let groupName = ''
  if (m.isGroup) {
    groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
    groupName = groupMetadata?.subject || ''
    groupAdmins = groupMetadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || []
  }
  const isBotAdmins = m.isGroup? groupAdmins.some(p => p.phoneNumber === botJid || p.jid === botJid || p.id === botJid || p.lid === botJid ) : false
  const isAdmins = m.isGroup? groupAdmins.some(p => p.phoneNumber === sender || p.jid === sender || p.id === sender || p.lid === sender ) : false
  const isOwners = [botJid,...(settings.owner? [settings.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender) || esExtraOwner;
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (plugin && typeof plugin.all === "function") {
      try { await plugin.all.call(client, m, { client }); } catch (err) { console.error(chalk.red(`[ TojiBot ALL Error -> ${name} ]`), err); }
    }
  }
  const today = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
  if (!users.stats) users.stats = {};
  if (!users.stats[today]) users.stats[today] = { msgs: 0, cmds: 0 };
  users.stats[today].msgs++;
  const rawBotname = settings.namebot || 'TojiBot-WD';
  const tipo = settings.type || 'TojiBot';
  const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s\-]/g, '')
  const namebot = cleanBotname || 'TojiBot-WD';
  const shortForms = [namebot.charAt(0), namebot.split(" ")[0], tipo.split(" ")[0], namebot.split(" ")[0].slice(0, 2), 'toji', 'toji bot'];
  const prefixes = shortForms.map(name => `${name}`);
  prefixes.unshift(namebot);
  let prefix;
  if (Array.isArray(settings.prefix) || typeof settings.prefix === 'string') {
    const prefixArray = Array.isArray(settings.prefix)? settings.prefix : [settings.prefix];
    prefix = new RegExp('^(' + prefixes.join('|') + ')?(' + prefixArray.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'i');
  } else if (settings.prefix === true) {
    prefix = new RegExp('^', 'i');
  } else {
    prefix = new RegExp('^(' + prefixes.join('|') + ')?', 'i');
  }
  const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  let pluginPrefix = client.prefix? client.prefix : prefix;
  let matchs = pluginPrefix instanceof RegExp? [[pluginPrefix.exec(m.text), pluginPrefix]] : Array.isArray(pluginPrefix)? pluginPrefix.map(p => {
    let regex = p instanceof RegExp? p : new RegExp(strRegex(p));
    return [regex.exec(m.text), regex];
  }) : typeof pluginPrefix === 'string'? [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] : [[null, null]];
  let match = matchs.find(p => p[0]);
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (!plugin) continue;
    if (plugin.disabled) continue;
    if (typeof plugin.before === "function") {
      try { if (await plugin.before.call(client, m, { client })) { continue; } } catch (err) { console.error(chalk.red(`[ TojiBot BEFORE Error -> ${name} ]`), err); }
    }
  }
  if (!match) return;
  let usedPrefix = (match[0] || [])[0] || '';
  let args = m.text.slice(usedPrefix.length).trim().split(" ");
  let command = (args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let text = args.join(' ');
  if (!command) return;
  if (!isOwners && settings.self) return;
  if (chat?.isBanned &&!(command === 'bot' && text === 'on') &&!global.owner.map(num => num + '@s.whatsapp.net').includes(sender) &&!esExtraOwner) {
    await m.reply(`El bot esta desactivado en este grupo. Activalo con: ${usedPrefix}bot on`);
    return;
  }
  const cmdData = global.comandos.get(command);
  if (!cmdData) {
    if (settings.prefix === true) return;
    await client.readMessages([m.key]);
    return m.reply(`El comando ${command} no existe. Usa ${usedPrefix}menu`);
  }
  if (cmdData.isOwner &&!global.owner.map(num => num + '@s.whatsapp.net').includes(sender) &&!esExtraOwner) {
    return m.reply(`El comando ${command} no existe. Usa ${usedPrefix}menu`);
  }
  try {
    await client.readMessages([m.key]);
    user.usedcommands = (user.usedcommands || 0) + 1;
    await cmdData.run(client, m, args, usedPrefix, command, text);
  } catch (error) {
    await client.sendMessage(m.chat, { text: `Error: ${error}` }, { quoted: m });
  }
  try { level(m); } catch {}
};
ENDOFFILE
echo "handler OK"
