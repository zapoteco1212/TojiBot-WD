import fs from "fs"
const file = "./database/econ.json"
if (!fs.existsSync("./database")) fs.mkdirSync("./database")
if (!fs.existsSync(file)) fs.writeFileSync(file, "{}")

function load() { return JSON.parse(fs.readFileSync(file, "utf-8")) }
function save(d) { fs.writeFileSync(file, JSON.stringify(d, null, 2)) }

export function getUser(id) {
  const db = load()
  if (!db[id]) db[id] = { money: 0, cooldowns: {} }
  return db[id]
}

export function addMoney(id, amount) {
  const db = load()
  if (!db[id]) db[id] = { money: 0, cooldowns: {} }
  db[id].money += amount
  save(db)
}

export function setCooldown(id, cmd, ms) {
  const db = load()
  if (!db[id]) db[id] = { money: 0, cooldowns: {} }
  db[id].cooldowns[cmd] = Date.now() + ms
  save(db)
}

export function getCooldown(id, cmd) {
  const db = load()
  if (!db[id]?.cooldowns[cmd]) return 0
  const time = db[id].cooldowns[cmd] - Date.now()
  return time > 0? time : 0
}
