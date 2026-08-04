import client from './tu-cliente-whatsapp.js'; // Ajusta esto a tu cliente
import { PREFIJO } from './prefix.js'; // Importa el prefijo que definiste
import fs from 'fs';
import path from 'path';

const comandosPath = path.join(process.cwd(), 'comandos');
const comandosFiles = fs.readdirSync(comandosPath).filter(file => file.endsWith('.js'));

// Variable para guardar los comandos cargados
const commands = new Map();

// Carga dinámica de comandos
(async () => {
    for (const file of comandosFiles) {
        const filePath = path.join(comandosPath, file);
        const { default: command } = await import(filePath);
        if (command && command.name) {
            commands.set(command.name, command);
            console.log(`✅ Comando cargado: ${command.name}`);
        }
    }
})();

// Escucha de mensajes
client.on('message', async (msg) => {
    const texto = msg.body;

    if (!texto.startsWith(PREFIJO)) return;

    const args = texto.slice(PREFIJO.length).trim().split(/ +/);
    const comandoNombre = args.shift().toLowerCase();

    // Busca y ejecuta el comando si existe
    const commandToRun = commands.get(comandoNombre);
    if (commandToRun) {
        try {
            await commandToRun.run(msg, client);
        } catch (error) {
            console.error(`Error ejecutando ${comandoNombre}:`, error);
            await msg.reply('❌ Ocurrió un error al ejecutar este comando.');
        }
    }
});
