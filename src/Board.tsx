import { BOARD_SIZE, squareAt, squarePosition, type BoardLayout, type Link } from './boardLayout.ts'

const CELL = 100
const VIEW = CELL * BOARD_SIZE

interface Point {
  x: number
  y: number
}

function squareCentre(square: number): Point {
  const { row, col } = squarePosition(square)
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 }
}

/** The direction from a to b as a unit vector, plus its perpendicular. */
function axes(a: Point, b: Point) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  const along = { x: dx / length, y: dy / length }
  const across = { x: -along.y, y: along.x }
  return { length, along, across }
}

const SNAKE_COLOURS = [
  { body: '#4caf50', outline: '#1b5e20', spots: '#c5e1a5' },
  { body: '#9c4dcc', outline: '#4a148c', spots: '#e1bee7' },
  { body: '#ff9800', outline: '#bf360c', spots: '#ffe0b2' },
  { body: '#29b6f6', outline: '#01579b', spots: '#e1f5fe' },
  { body: '#ef5350', outline: '#8e0000', spots: '#ffcdd2' },
  { body: '#d4c21a', outline: '#6d5f00', spots: '#fff9c4' },
]

function Snake({ snake, index }: { snake: Link; index: number }) {
  const head = squareCentre(snake.from)
  const tail = squareCentre(snake.to)
  const { length, along, across } = axes(head, tail)
  const colours = SNAKE_COLOURS[index % SNAKE_COLOURS.length]

  // The body wiggles along the line from head to tail and tapers to the tail.
  const waves = Math.max(1.5, Math.round(length / 160) + 0.5)
  const amplitude = 22 * (index % 2 === 0 ? 1 : -1)
  const steps = 48
  const points: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const wiggle = Math.sin(t * waves * 2 * Math.PI) * amplitude * Math.min(1, t * 4)
    points.push({
      x: head.x + along.x * length * t + across.x * wiggle,
      y: head.y + along.y * length * t + across.y * wiggle,
    })
  }
  const width = (i: number) => 26 - (i / steps) * 20
  const segments = points.slice(0, -1).map((p, i) => ({ p, q: points[i + 1], w: width(i) }))

  const facing = (Math.atan2(-along.y, -along.x) * 180) / Math.PI

  return (
    <g className="snake">
      <title>{`Snake from ${snake.from} to ${snake.to}`}</title>
      <g opacity={0.25} transform="translate(6 8)">
        {segments.map(({ p, q, w }, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#000" strokeWidth={w + 6} strokeLinecap="round" />
        ))}
      </g>
      {segments.map(({ p, q, w }, i) => (
        <line key={`o${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colours.outline} strokeWidth={w + 6} strokeLinecap="round" />
      ))}
      {segments.map(({ p, q, w }, i) => (
        <line key={`b${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colours.body} strokeWidth={w} strokeLinecap="round" />
      ))}
      {points.map((p, i) =>
        i > 3 && i < steps - 2 && i % 4 === 0 ? (
          <circle key={`s${i}`} cx={p.x} cy={p.y} r={width(i) * 0.25} fill={colours.spots} />
        ) : null,
      )}
      <g transform={`translate(${head.x} ${head.y}) rotate(${facing})`}>
        <path d="M 22 0 l 14 -5 M 22 0 l 14 5 M 14 0 L 24 0" stroke="#e53935" strokeWidth={3} strokeLinecap="round" fill="none" />
        <ellipse cx={0} cy={0} rx={24} ry={19} fill={colours.body} stroke={colours.outline} strokeWidth={4} />
        <ellipse cx={-4} cy={-6} rx={9} ry={5} fill="#fff" opacity={0.35} />
        <circle cx={6} cy={-9} r={7} fill="#fff" stroke={colours.outline} strokeWidth={2} />
        <circle cx={6} cy={9} r={7} fill="#fff" stroke={colours.outline} strokeWidth={2} />
        <circle cx={9} cy={-9} r={3.5} fill="#111" />
        <circle cx={9} cy={9} r={3.5} fill="#111" />
        <circle cx={10} cy={-10.5} r={1.2} fill="#fff" />
        <circle cx={10} cy={7.5} r={1.2} fill="#fff" />
      </g>
    </g>
  )
}

function Ladder({ ladder }: { ladder: Link }) {
  const bottom = squareCentre(ladder.from)
  const top = squareCentre(ladder.to)
  const { length, along, across } = axes(bottom, top)
  const half = 17
  // Start and end the ladder a little beyond the square centres.
  const start = { x: bottom.x - along.x * 18, y: bottom.y - along.y * 18 }
  const end = { x: top.x + along.x * 18, y: top.y + along.y * 18 }
  const total = length + 36
  const rail = (side: number) => ({
    x1: start.x + across.x * half * side,
    y1: start.y + across.y * half * side,
    x2: end.x + across.x * half * side,
    y2: end.y + across.y * half * side,
  })
  const rungCount = Math.max(2, Math.floor(total / 34))
  const rungs = Array.from({ length: rungCount }, (_, i) => {
    const t = (i + 0.5) / rungCount
    const c = { x: start.x + along.x * total * t, y: start.y + along.y * total * t }
    return {
      x1: c.x - across.x * half,
      y1: c.y - across.y * half,
      x2: c.x + across.x * half,
      y2: c.y + across.y * half,
    }
  })
  const parts = [...rungs, rail(-1), rail(1)]

  return (
    <g className="ladder">
      <title>{`Ladder from ${ladder.from} to ${ladder.to}`}</title>
      <g opacity={0.25} transform="translate(6 8)">
        {parts.map((l, i) => (
          <line key={i} {...l} stroke="#000" strokeWidth={12} strokeLinecap="round" />
        ))}
      </g>
      {parts.map((l, i) => (
        <line key={`o${i}`} {...l} stroke="#5d3a14" strokeWidth={12} strokeLinecap="round" />
      ))}
      {parts.map((l, i) => (
        <line key={`w${i}`} {...l} stroke={i < rungs.length ? '#e0a458' : '#c97f2e'} strokeWidth={6} strokeLinecap="round" />
      ))}
      {[rail(-1), rail(1)].map((l, i) => (
        <line key={`h${i}`} {...l} stroke="#f6d39b" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      ))}
    </g>
  )
}

function Board({ layout }: { layout: BoardLayout }) {
  const squares = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = squareAt(row, col)
      const shade = (row + col) % 2 === 0 ? 'light' : 'dark'
      squares.push(
        <div key={square} className={`square square-${shade}`} data-testid="square">
          {square}
        </div>,
      )
    }
  }

  return (
    <div className="board" aria-label="Snakes and ladders board">
      <div className="squares">{squares}</div>
      <svg className="overlay" viewBox={`0 0 ${VIEW} ${VIEW}`}>
        {layout.ladders.map((ladder) => (
          <Ladder key={`l${ladder.from}`} ladder={ladder} />
        ))}
        {layout.snakes.map((snake, i) => (
          <Snake key={`s${snake.from}`} snake={snake} index={i} />
        ))}
      </svg>
    </div>
  )
}

export default Board
