/*
Creador: 亗WERKITO亗
Adaptado a TojiBot-WD
*/

let handler = async (m, { conn }) => {
const who = m.sender

try {
const groupMetadata = await conn.groupMetadata(m.chat)
const participant = groupMetadata.participants.find((p) => p.id === who)

if (participant?.admin) {
return conn.sendMessage(
m.chat,
{
text: `《✧》 *@${who.split('@')[0]}* ya eras administrador del grupo con anterioridad\n\n> *Moderador*: @${who.split('@')[0]}\n> Staff 𝖲⍴ᥲᥴᥱ𝖭іgһ𝗍 𝖳ᥱᥲm`,
mentions: [who],
},
{ quoted: m },
)
}

await conn.groupParticipantsUpdate(m.chat, [who], 'promote')

await conn.sendMessage(
m.chat,
{
text: `✿ El *Owner* *@${who.split('@')[0]}* ahora tiene privilegios de administrador en este grupo\n\n> *Moderador*: @${who.split('@')[0]}\n> Staff 𝖲⍴ᥲᥴᥱ𝖭іgһ𝗍 𝖳ᥱᥲm`,
mentions: [who],
},
{ quoted: m },
)
} catch (err) {
console.error(err)
await conn.reply(m.chat, `✖️ No pude darte admin. Asegúrate que el bot sea admin.`, m)
}
}

handler.help = ['autoadmin']
handler.tags = ['owner']
handler.command = /^(autoadmin)$/i
handler.owner = true
handler.rowner = true
handler.group = true
handler.botAdmin = true

export default handler
