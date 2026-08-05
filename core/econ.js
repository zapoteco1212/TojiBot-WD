import fs from "fs"
const file = "./database/econ.json"
if (!fs.existsSync("./database")) fs.mkdirSync("./database")
if (!fs.existsSync(file)) fs.writeFileSync(file, "{}")

function load() {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")) } catch { return {} }
}
function save(d) { fs.writeFileSync(file, JSON.stringify(d, null, 2)) }

function ensure(id) {
  const db = load()
  if (!db[id]) {
    db[id] = { money: 0, coins: 0, cooldowns: {} }
    save(db)
  }
  return db
}

export function getUser(id) {
  ensure(id)
  const db = load()
  return db[id]
}

// Cooldowns
export function setCooldown(id, cmd, ms) {
  const db = load()
  if (!db[id]) db[id] = { money: 0, coins: 0, cooldowns: {} }
  db[id].cooldowns[cmd] = Date.now() + ms
  save(db)
}
export function getCooldown(id, cmd) {
  const db = load()
  if (!db[id]?.cooldowns?.[cmd]) return 0
  const left = db[id].cooldowns[cmd] - Date.now()
  return left > 0? left : 0
}

// Para compatibilidad con tus juegos viejos y nuevos
export function addCoins(id, amount) {
  const db = load()
  if (!db[id]) db[id] = { money: 0, coins: 0, cooldowns: {} }
  db[id].money += amount
  db[id].coins += amount
  save(db)
}
export function removeCoins(id, amount) {
  return addCoins(id, -amount)
}
export function getCoins(id) {
  const db = load()
  return db[id]?.money || 0
}

// Alias para que no vuelva a fallar
export const addMoney = addCoins
export const removeMoney = removeCoins
export const getMoney = getCoins
export const addCash = addCoins
