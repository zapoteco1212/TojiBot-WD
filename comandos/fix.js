import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export default {
    name: 'fix',
    async run(msg, client, m, args, usedprefix) => {
        await msg.reply('🔄 Actualizando desde GitHub y reiniciando...');
        try {
            const { stdout } = await execAsync('git pull');
            await msg.reply(`✅ Git Pull exitoso:\n\`\`\`${stdout.trim()}\`\`\`\nReiniciando bot...`);
            process.exit(0); // Reinicia el proceso
        } catch (error) {
            await msg.reply(`❌ Error al actualizar:\n\`\`\`${error.message}\`\`\``);
        }
    }
};