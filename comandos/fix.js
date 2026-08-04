import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const PREFIJO = '!';

const manejarMensaje = async (msg) => {
    const texto = msg.body;

    if (!texto.startsWith(PREFIJO)) return;

    const args = texto.slice(PREFIJO.length).trim().split(/ +/);
    const comando = args.shift().toLowerCase();

    if (comando === 'ping') {
        await msg.reply('pong! 🏓');
    }

    if (comando === 'fix') {
        await msg.reply('🔄 Descargando cambios desde GitHub y actualizando...');

        try {
            const { stdout } = await execAsync('git pull');
            
            await msg.reply(`✅ Git Pull exitoso:\n\`\`\`${stdout.trim()}\`\`\`\nReiniciando bot...`);

            process.exit(0);
        } catch (error) {
            await msg.reply(`❌ Error al actualizar desde GitHub:\n\`\`\`${error.message}\`\`\``);
        }
    }
};

export default manejarMensaje;
