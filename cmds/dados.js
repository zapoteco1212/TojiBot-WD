import initDB from '../lib/initDB.js'

const DICE = {
  1: { emoji: '⚀', multi: 4 },
  2: { emoji: '⚁', multi: 2 },
  3: { emoji: '⚂', multi: 2 },
  4: { emoji: '⚃', multi: 1 },
  5: { emoji: '⚄', multi: 3 },
  6: { emoji: '⚅', multi: 3 }
}

export default {
  command: ['dados', 'dice'],
  category: 'economy',

  run: async (client, m, args, usedPrefix, command) => {
    const { settings, user, chat } = initDB(m, client)

    if (!m.isGroup) return

    if (chat.onlyAdmin || chat.isBanned) {
      return m.reply('* Los comandos de economía están desactivados o el chat está baneado.')
    }

    const monedas = settings.currency || 'TojiCoins'

    const cooldown = 5400000
    const id = m.sender

    chat.diceCooldown = chat.diceCooldown || {}
    const last = chat.diceCooldown[id] || 0

    if (Date.now() - last < cooldown) {
      const restante = cooldown - (Date.now() - last)
      const horas = Math.floor(restante / 3600000)
      const minutos = Math.floor((restante % 3600000) / 60000)

      return m.reply(`*${command.toUpperCase()}*
──────────────
😔 Debes esperar para volver a jugar.

> ${horas}h ${minutos}m restantes`)
    }

    const apuesta = parseInt(args[0])

    if (isNaN(apuesta) || apuesta <= 0) {
      return m.reply(`*${command.toUpperCase()}*
──────────────
* Usa el comando así:

> ${usedPrefix + command} cantidad

* Ejemplo:
> ${usedPrefix + command} 50000`)
    }

    const maxBet = 200000000000

    if (apuesta > maxBet) {
      return m.reply(`*${command.toUpperCase()}*
──────────────
* Máximo permitido:

> $${maxBet.toLocaleString()} ${monedas}`)
    }

    if (user.money < apuesta) {
      return m.reply(`* No tienes suficientes ${monedas}. Tu saldo actual es de $${user.money.toLocaleString()} ${monedas}.`)
    }

    chat.diceCooldown[id] = Date.now()

    const n1 = Math.floor(Math.random() * 6) + 1
    const n2 = Math.floor(Math.random() * 6) + 1

    const d1 = DICE[n1]
    const d2 = DICE[n2]

    let multiplicador = 0
    let bonusText = ''

    if (n1 === n2) {
      multiplicador = d1.multi * d2.multi
      bonusText = `* BONUS DOBLE\n> (x${d1.multi} × x${d2.multi})`
    } else {
      multiplicador = d1.multi + d2.multi
      bonusText = `* Bonus\n> (x${d1.multi} + x${d2.multi})`
    }

    const ganancias = apuesta * multiplicador
    user.money = (user.money - apuesta) + ganancias

    return m.reply(`*${command.toUpperCase()}*
──────────────
* Lanzamiento:

Dado 1: ${d1.emoji} ${n1}
Dado 2: ${d2.emoji} ${n2}

* Tu apuesta:
> $${apuesta.toLocaleString()} ${monedas}

──────────────
¡Has recibido un multiplicador de *x${multiplicador}*!

${bonusText}

──────────────
* Total recibido:
> $${ganancias.toLocaleString()} ${monedas}

* Nuevo saldo:
> $${user.money.toLocaleString()} ${monedas}`)
  }
}
