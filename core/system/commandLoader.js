import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TojiBot-WD by zapoteco1212 - Sistema de Carga de Comandos
global.comandos = new Map();
global.plugins = {};
const pluginCache = new Map();
const commandsFolder = path.join(__dirname, "../../plugins");

async function seeCommands(dir = commandsFolder) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.cyan(`[ TojiBot-WD ] Carpeta creada: ${dir}`));
    return;
  }
  const items = fs.readdirSync(dir);
  for (const fileOrFolder of items) {
    const fullPath = path.join(dir, fileOrFolder);
    if (fs.lstatSync(fullPath).isDirectory()) {
      await seeCommands(fullPath);
      continue;
    }
    if (!fileOrFolder.endsWith(".js")) continue;
    try {
      const mtime = fs.statSync(fullPath).mtimeMs;
      const cached = pluginCache.get(fullPath);
      let imported;
      if (cached && cached.mtime === mtime) {
        imported = cached.imported;
      } else {
        const modulePath = `${path.resolve(fullPath)}?update=${Date.now()}`;
        imported = await import(modulePath);
        pluginCache.set(fullPath, { mtime, imported });
      }
      const comando = imported.default;
      const pluginName = fileOrFolder.replace(".js", "");
      global.plugins[pluginName] = imported;
      if (!comando?.command || typeof comando.run!== "function") continue;
      const cmds = Array.isArray(comando.command)? comando.command : [comando.command];
      cmds.forEach(cmd => {
        if (!cmd) return;
        global.comandos.set(cmd.toLowerCase(), {
          pluginName,
          run: comando.run,
          category: comando.category || "toji",
          isOwner: comando.isOwner || false,
          isAdmin: comando.isAdmin || false,
          bot
