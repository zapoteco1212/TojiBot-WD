let isNumber = (x) => typeof x === 'number' &&!isNaN(x)

function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  const settings = global.db.data.settings[jid] ||= {}
  settings.self??= false
  settings.prefix??= ['/', '!', '.', '#', '>']
  settings.commandsejecut??= isNumber(settings.commandsejecut)? settings.commandsejecut : 0

  settings.id??= '120363198641161536@newsletter'

  // TojiBot-WD Canal Oficial
  settings.nameid??= "'⚔️ Toji Fushiguro - TojiBot-WD Oficial ࿐"

  settings.type??= 'Owner'
  settings.link??= 'https://github.com/zapoteco1212/TojiBot-WD'
  settings.banner??= 'https://i.imgur.com/TojiFushiguroBanner.jpg'
  settings.icon??= 'https://i.imgur.com/TojiFushiguroIcon.jpg'
  settings.currency??= 'TojiCoins'
  settings.namebot??= 'Toji'
  settings.botname??= 'TojiBot-WD'
  settings.owner??= '527444317595'
  settings.ownername??= 'zapoteco1212'

  const user = global.db.data.users[m.sender] ||= {}
  user.name??= m.pushName
  user.exp = is
