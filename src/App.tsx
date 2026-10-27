import { useMemo, useState } from 'react'
import Board from './Board.tsx'
import Dice from './Dice.tsx'
import { generateBoard } from './boardLayout.ts'
import { newSeed } from './random.ts'

function App({ initialSeed }: { initialSeed?: number }) {
  const [seed, setSeed] = useState(() => initialSeed ?? newSeed())
  const layout = useMemo(() => generateBoard(seed), [seed])

  return (
    <main className="app">
      <h1>Snakes and Ladders</h1>
      <div className="controls">
        <span className="seed">
          Seed: <strong>{seed}</strong>
        </span>
        <button type="button" onClick={() => setSeed(newSeed(seed))}>
          Randomise
        </button>
      </div>
      <div className="play-area">
        <Board layout={layout} />
        <Dice />
      </div>
    </main>
  )
}

export default App
