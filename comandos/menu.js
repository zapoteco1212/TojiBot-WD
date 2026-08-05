cat > comandos/menu.js <<'EOF'
export default {
  name: "menu",
  async execute(sock, m) {
    const jid = m.key.remoteJid
    const menu = `╭━━━〔 *TojiBot-WD* 〕━━━⬣
┃ ✦ .ping
┃ ✦ .menu
┃ ✦ .sticker (responde a imagen)
┃ ✦ .code 521xxx
╰━━━━━━━━━━━━━━⬣
> Bot hecho por Toji`
    await sock.sendMessage(jid, { text: menu })
  }
}
EOF
