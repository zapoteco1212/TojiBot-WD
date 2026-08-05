import fs from "fs"

function loadPrefixes() {
  try {
    if (fs.existsSync("./database/prefix.json")) {
      const data = JSON.parse(fs.readFileSync("./database/prefix.json", "utf-8"))
      if (data.prefixes && data.prefixes.length > 0) return data.prefixes
    }
  } catch {}
  return ["#"] // por defecto
}

export const prefixes = loadPrefixes()

export function updatePrefixes(newPrefixes) {
  prefixes.length = 0
  prefixes.push(...newPrefixes)
  fs.writeFileSync("./database/prefix.json", JSON.stringify({ prefixes: newPrefixes }, null, 2))
}
