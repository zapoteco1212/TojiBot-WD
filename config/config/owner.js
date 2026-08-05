import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

const botOwner = ['527444200627'] // Tu número principal

const mainOwners = [
 // Aquí agregas después
]

const extraOwners = [
 // Aquí agregas después
]

global.owner = [...botOwner, ...mainOwners, ...extraOwners]
global.botNumber = ''

global.sessionName = 'Sessions/Owner'
global.version = '^1.0 - TojiBot-WD'
global.dev = "© TojiBot-WD powered | zapoteco1212"
global.links = {
  channel: "https://whatsapp.com/channel/0029VaAN15BJP21BYCJ3tH04",
  github: "https://github.com/zapoteco1212/TojiBot-WD",
}

global.mess = {
  socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
  admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.'
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
