import fs from "fs"
const path = "./database/economy.json"
function load() {
  if (!fs.existsSync(path)) { fs.writeFileSync(path, JSON.stringify({})); return {} }
  try { return JSON.parse(fs.readFileSync(path)) } catch { return {} }
}
function save(data) { fs.writeFileSync(path, JSON.stringify(data, null, 2)) }
export function getUser(id) {
  const db = load()
  if (!db[id]) db[id] = { coins: 1000, lastWork: 0, lastDaily: 0 }
  save(db)
  return db[id]
}
export function addCoins(id, amount) {
  const db = load()
  if (!db[id]) db[id] = { coins: 1000, lastWork: 0, lastDaily: 0 }
  db[id].coins += amount
  if (db[id].coins < 0) db[id].coins = 0
  save(db)
  return db[id].coins
}
export function setCooldown(id, type) {
  const db = load()
  if (!db[id]) db[id] = { coins: 1000, lastWork: 0, lastDaily: 0 }
  db[id][type] = Date.now()
  save(db)
}
