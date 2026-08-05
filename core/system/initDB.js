let isNumber = (x) => typeof x === 'number' &&!isNaN(x)
function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const settings = global.db.data.settings[jid] ||= {}
  settings.self??= false
  settings.prefix??= ['/', '!', '.', '#', '>']
  settings.commandsejecut??= isNumber(settings.commandsejecut)? settings.commandsejecut : 0
  settings.id??= '120363198641161536@newsletter'
  settings.nameid??= 'Toji Fushiguro - TojiBot-WD Oficial'
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
  user.exp = isNumber(user.exp)? user.exp : 0
  user.limit = isNumber(user.limit)? user.limit : 10
  user.money = isNumber(user.money)? user.money : 0
  user.joincount = isNumber(user.joincount)? user.joincount : 0
  user.level = isNumber(user.level)? user.level : 0
  user.role??= 'Novato'
  user.registered??= false
  user.banned??= false
  user.premium??= false
  const chat = global.db.data.chats[m.chat] ||= {}
  chat.isBanned??= false
  chat.welcome??= true
  chat.antiLink??= false
  chat.antiToxic??= false
  chat.onlyAdmin??= false
  return { settings, user, chat }
}
export default initDB;
