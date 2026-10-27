import { useEffect, useRef, useState } from 'react'
import { randomInt, type Rng } from './random.ts'

/** How long a roll tumbles for, in milliseconds. Matches the transition in index.css. */
export const ROLL_MS = 800

/** Where each face sits on the cube: opposite faces add up to 7. */
const FACE_TRANSFORMS: Record<number, string> = {
  1: 'rotateY(0deg)',
  2: 'rotateY(90deg)',
  3: 'rotateX(90deg)',
  4: 'rotateX(-90deg)',
  5: 'rotateY(-90deg)',
  6: 'rotateY(180deg)',
}

/** The cube rotation (x, y in degrees) that brings each face to the front. */
const SHOW_FACE: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
}

/** Which cells of a 3x3 grid (0-8, left to right, top to bottom) hold a pip. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function Face({ value }: { value: number }) {
  return (
    <div className={`die-face die-face-${value}`} style={{ transform: `${FACE_TRANSFORMS[value]} translateZ(var(--die-half))` }}>
      {PIPS[value].map((cell) => (
        <span key={cell} className="pip" style={{ gridArea: `${Math.floor(cell / 3) + 1} / ${(cell % 3) + 1}` }} />
      ))}
    </div>
  )
}

function Die({ value, rolls, index }: { value: number; rolls: number; index: number }) {
  // Whole extra turns make the die tumble on each roll but leave the same face in front.
  const { x, y } = SHOW_FACE[value]
  const spinX = x + 360 * rolls * 2
  const spinY = y + 360 * rolls * (index % 2 === 0 ? 1 : -1)

  return (
    <div className="die" role="img" aria-label={`Die showing ${value}`} data-value={value}>
      <div className="die-cube" style={{ transform: `rotateX(${spinX}deg) rotateY(${spinY}deg)` }}>
        {[1, 2, 3, 4, 5, 6].map((face) => (
          <Face key={face} value={face} />
        ))}
      </div>
    </div>
  )
}

function Dice({ rng = Math.random }: { rng?: Rng }) {
  const [values, setValues] = useState<[number, number]>([1, 1])
  const [rolls, setRolls] = useState(0)
  const [rolling, setRolling] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function roll() {
    setValues([randomInt(rng, 1, 6), randomInt(rng, 1, 6)])
    setRolls((r) => r + 1)
    setRolling(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setRolling(false), ROLL_MS)
  }

  return (
    <section className="dice-area" aria-label="Dice">
      <div className={`dice${rolling ? ' dice-rolling' : ''}`}>
        {values.map((value, i) => (
          <Die key={i} value={value} rolls={rolls} index={i} />
        ))}
      </div>
      <div className="controls">
        <button type="button" onClick={roll} disabled={rolling}>
          Roll dice
        </button>
        <span className="dice-total" aria-live="polite">
          {rolling ? 'Rolling…' : rolls > 0 ? `Rolled ${values[0]} and ${values[1]}` : ' '}
        </span>
      </div>
    </section>
  )
}

export default Dice
