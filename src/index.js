const EDITOR = false
const TILE = {
  SPACE: 0,
  WALL: 1,
  GHOST_HOME: 2,
  WARP: 3,
  PLAYER: 4
}
const TILES_BY_CHIP = {
  x: 1,
  G: 2,
  ' ': 0,
  '$': 3,
  'P': 4
}

const chipToTileId = (chip) => TILES_BY_CHIP[chip]

const game = {
  level: [
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x                             x',
    'x             P               x',
    'x                             x',
    'x                             x',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  ],
  width: 0,
  height: 0,
  dots: [],
  powerDots: [],
  player: {
    x: 0,
    y: 0,
    direction: 'right',
    time: 0,
    moveTime: 4,
    state: 'normal',
    cooldown: 120,
    powerTime: 5,
    animation: {
      frame: 0,
      frames: 2,
      frameTime: 0,
      frameDelay: 5,
      update () {
        const { animation } = game.player
        animation.frameTime += 1
        if (animation.frameTime >= animation.frameDelay) {
          animation.frameTime -= animation.frameDelay
          animation.frame += 1
          if (animation.frame >= animation.frames) {
            animation.frame = 0
          }
        }
      }
    }
  },
  started: false,
  init () {
    const convertLevelToTilemap = () => {
      game.level = game.level.map(rowData => {
        return rowData.split('').map(chipToTileId)
      })
    }

    convertLevelToTilemap()
    game.width = game.level[0].length
    game.height = game.level.length

    const locatePlayerStart = () => {
      for (let row = 0; row < game.height; row += 1) {
        for (let column = 0; column < game.width; column += 1) {
          if (game.level[row][column] === TILE.PLAYER) {
            game.player.x = column
            game.player.y = row
            game.level[row][column] = TILE.SPACE
          }
        }
      }
    }

    locatePlayerStart()

    const isCorner = (row, column) => {
      const topLeft = column === 1 && row === 1
      const topRight = column === game.width - 2 && row === 1
      const bottomLeft = column === 1 && row === game.height - 2
      const bottomRight = column === game.width - 2 && row === game.height - 2
      return topLeft || topRight || bottomLeft || bottomRight
    }

    game.level.forEach((rowData, row) => {
      rowData.forEach((tileId, column) => {
        if (tileId === TILE.SPACE) {
          if (isCorner(row, column)) {
            game.powerDots.push({ row, column })
          } else {
            if (row === game.player.y && column === game.player.x) {
            } else {
              game.dots.push({ row, column })
            }
          }
        }
      })
    })

  }
}

const collides = (x, y) => {
  return game.level[y][x] !== TILE.SPACE
}

const eat = () => {
  const { player, dots, powerDots } = game
  const { x, y } = player
  const matchDot = dot => dot.column === x && dot.row === y

  const dotHere = dots.filter(matchDot).length > 0
  if (dotHere) {
    game.dots = dots.filter(dot => dot.column !== x || dot.row !== y)
    console.log('eat dot')
  }

  const powerDotHere = powerDots.filter(matchDot).length > 0
  if (powerDotHere) {
    console.log('power dot')
    game.powerDots = powerDots.filter(dot => dot.column !== x || dot.row !== y)
    player.state = 'powered'
  }
}

const playerControls = {
  up () {
    if (game.player.y > 0) {
      game.player.y -= 1
      if (collides(game.player.x, game.player.y)) {
        game.player.y += 1
      }
    }
  },
  down () {
    if (game.player.y < game.height - 1) {
      game.player.y += 1
      if (collides(game.player.x, game.player.y)) {
        game.player.y -= 1
      }
    }
  },
  left () {
    if (game.player.x > 0) {
      game.player.x -= 1
      if (collides(game.player.x, game.player.y)) {
        game.player.x += 1
      }
    }
  },
  right () {
    if (game.player.x < game.width - 1) {
      game.player.x += 1
      if (collides(game.player.x, game.player.y)) {
        game.player.x -= 1
      }
    }
  },
  move (direction) {
    game.player.time += 1
    if (game.player.time >= game.player.moveTime) {
      game.player.time -= game.player.moveTime
      playerControls[direction]()
      eat()
    }
  }
}

// VIEW

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const update = () => {
  if (game.started) {
    game.player.animation.update()
    playerControls.move(game.player.direction)
    if (game.player.state !== 'normal') {
      game.player.cooldown -= 1
      if (game.player.cooldown < 0) {
        game.player.cooldown = game.player.powerTime
        game.player.state = 'normal'
      }
    }
  }
}

const draw = () => {
  const {
    level,
    dots,
    powerDots,
    width,
    height
  } = game
  const tileWidth = ~~(canvas.width / width)
  const tileHeight = ~~(canvas.height / height)
  const halfTileWidth = ~~(tileWidth * 0.5)
  const halfTileHeight = ~~(tileHeight * 0.5)
  const offsetX = canvas.width - (width * tileWidth)
  const offsetY = canvas.height - (height * tileHeight)
  ctx.save()
  ctx.translate(offsetX, offsetY)

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.fillStyle = 'lime'

  level.forEach((rowData, row) => {
    rowData.forEach((tileId, column) => {
      if (tileId === 1) {
        ctx.fillRect(
          (column * tileWidth) | 0,
          (row * tileHeight) | 0,
          0.5 + tileWidth | 0,
          1 + tileHeight | 0)
      }
    })
  })
  ctx.restore()

  ctx.save()
  ctx.fillStyle = game.player.state === 'normal'
    ? 'white'
    : 'yellow'
  let dotRadius = ~~(Math.min(Math.max(tileWidth, tileHeight)) * 0.15)
  dots.forEach(dot => {
    const x = halfTileWidth + (dot.column * tileWidth) - ~~(dotRadius * 0.5)
    const y = halfTileHeight + (dot.row * tileHeight) - ~~(dotRadius * 0.5)
    ctx.fillRect(x, y, dotRadius, dotRadius)
  })

  ctx.fillStyle = game.player.state === 'normal'
    ? 'orange'
    : 'white'
  dotRadius = ~~(Math.min(Math.max(tileWidth, tileHeight)) * 0.25)
  powerDots.forEach(dot => {
    const x = halfTileWidth + (dot.column * tileWidth) - ~~(dotRadius * 0.5)
    const y = halfTileHeight + (dot.row * tileHeight) - ~~(dotRadius * 0.5)
    ctx.fillRect(x, y, dotRadius, dotRadius)
  })

  ctx.restore()

  ctx.save()
  ctx.fillStyle = game.player.state === 'normal'
    ? 'yellow'
    : 'cornflowerblue'
  dotRadius = ~~(Math.min(Math.max(tileWidth, tileHeight)) * 0.3)
  const halfDotRadius = ~~(dotRadius * 0.5)

  const x = halfTileWidth + (tileWidth * game.player.x)
  const y = halfTileHeight + (tileHeight * game.player.y)

  const angleOfRotation = ({
    left: 180,
    right: 0,
    up: 270,
    down: 90
  })[game.player.direction] * (Math.PI / 180)

  ctx.translate(x, y)
  ctx.rotate(angleOfRotation)

  if (game.player.animation.frame) {
    ctx.beginPath()
    ctx.arc(0, 0, dotRadius, 0, 2 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(0, 0, dotRadius, 0.25 * Math.PI, 1.25 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, 0, dotRadius, 0.75 * Math.PI, 1.75 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()


  ctx.restore()
}

const mainLoop = () => {
  if (EDITOR) {
    updateEditor()
    draw()
    drawEditor()
  } else {
    update()
    draw()
  }
  setTimeout(() => {
    mainLoop()
  }, 33)
}

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  ENTER: 13,
  SPACE: 32
}

const start = () => {
  game.init()
  window.addEventListener('keydown', keyEvent => {
    game.started = true
    const action = {
      [KEY.UP] () {
        game.player.direction = 'up'
        game.player.time = 0
      },
      [KEY.DOWN] () {
        game.player.direction = 'down'
        game.player.time = 0
      },
      [KEY.LEFT] () {
        game.player.direction = 'left'
        game.player.time = 0
      },
      [KEY.RIGHT] () {
        game.player.direction = 'right'
        game.player.time = 0
      }
    }[keyEvent.keyCode]

    action && action()
  }, false)
  mainLoop()
}

start()
