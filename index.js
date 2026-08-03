const fs = require('fs')
const path = require('path')

// Esta función lee las carpetas automáticamente al iniciar
function cargarCarpetas() {
  const carpetas = ['./plugins', './comandos', './src']
  carpetas.forEach(carpeta => {
    if (fs.existsSync(carpeta)) {
      const archivos = fs.readdirSync(carpeta)
      console.log(`✅ Carpeta leída: ${carpeta} - ${archivos.length} archivos`)
    }
  })
}

// Cuando inicie el bot, que cargue todo
cargarCarpetas()

// Aquí va tu código de conexión del bot
console.log('Iniciando TojiBot-WD...')
