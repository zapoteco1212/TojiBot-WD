import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  '527444200627'
]

global.mods = []
global.prems = []
global.botNumber = '527444200627'

global.sessionName = './Sessions/Owner'
global.botname = 'TojiBot-WD'
global.namebot = 'TojiBot-WD'
global.wm = 'TojiBot-WD by zapoteco1212'
global.vs = '2.0.0 - WD Edition'
global.author = 'zapoteco1212'
global.premium = true

global.packname = 'TojiBot-WD'
global.stickerpack = 'TojiBot-WD\nby zapoteco1212'

global.dbdata = {
  users: {},
  chats: {},
  stats: {},
  msgs: {},
  sticker: {},
  settings: {}
}

global.libreria = 'Baileys'
global.vs = 'TojiBot-WD'
global.lenguaje = 'es'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.yellowBright(`Actualizado settings.js`))
  import(`${file}?update=${Date.now()}`)
})
