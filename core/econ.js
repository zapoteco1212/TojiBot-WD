import fs from "fs"
import path from "path"

const dbFolder = "./database"
const dbPath = path.join(dbFolder, "economy.json")

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true })
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}, null, 2))
}

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf-8"))
  } catch {
    return {}
  }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

export function getUser(id) {
  const db = loadDB()
  if (!db[id]) {
    db[id] = { coins: 1000 }
    saveDB(db)
  }
  return db[id]
}

export function addCoins(id, amount) {
  const db = loadDB()
  if (!db[id]) db[id] = { coins: 1000 }
  db[id].coins += amount
  saveDB(db)
  return db[id].coins
}

export function removeCoins(id, amount) {
  const db = loadDB()
  if (!db[id]) db[id] = { coins: 1000 }
  db[id].coins -= amount
  if (db[id].coins < 0) db[id].coins = 0
  saveDB(db)
  return db[id].coins
}
