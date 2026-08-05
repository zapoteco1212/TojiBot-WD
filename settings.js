import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

const botOwner = ['527444200627'] 

const mainOwners = []

const extraOwners = []

global.owner = [...botOwner, ...mainOwners, ...extraOwners]
global.botNumber = ''

global.sessionName = 'Sessions/TojiBot'
global.version = '^1.0 - TojiBot'
global.dev = "© TojiBot | zapoteco1212"
global.links = {
  api: 'https://api.evogb.org',
  channel: "https://whatsapp.com/channel/TU_CANAL_AQUI",
  github: "https://github.com/zapoteco1212",
  gmail: "tu_correo@gmail.com"
}
global.my = {
  ch: '120363401404146384@newsletter',
  name: 'TojiBot - Official Channel',
}

global.mess = {
  socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
  admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.'
}

global.APIs = {
  axi
