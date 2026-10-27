import { createRng, randomInt } from './random.ts'

export const BOARD_SIZE = 10
export const SQUARE_COUNT = BOARD_SIZE * BOARD_SIZE

/** A snake or ladder, moving a player from one square to another. */
export interface Link {
  from: number
  to: number
}

export interface BoardLayout {
  snakes: Link[]
  ladders: Link[]
}

/** The grid position of a square; row 0 is the top row, column 0 the left column. */
export interface GridPosition {
  row: number
  col: number
}

/** The row of a square counted from the bottom, starting at 0. */
export function rowFromBottom(square: number): number {
  return Math.floor((square - 1) / BOARD_SIZE)
}

/**
 * Finds where a square sits on the grid. Square 1 is bottom left and the
 * numbering runs back and forth: left to right on the bottom row, right to
 * left on the next, and so on.
 */
export function squarePosition(square: number): GridPosition {
  const bottomRow = rowFromBottom(square)
  const offset = (square - 1) % BOARD_SIZE
  return {
    row: BOARD_SIZE - 1 - bottomRow,
    col: bottomRow % 2 === 0 ? offset : BOARD_SIZE - 1 - offset,
  }
}

/** Finds which square sits at a grid position. */
export function squareAt(row: number, col: number): number {
  const bottomRow = BOARD_SIZE - 1 - row
  const offset = bottomRow % 2 === 0 ? col : BOARD_SIZE - 1 - col
  return bottomRow * BOARD_SIZE + offset + 1
}

const MAX_ROW_SPAN = 5
const MAX_ATTEMPTS = 1000

/**
 * Places snakes and ladders on the board from a seed; the same seed always
 * gives the same layout. No two share a square, none uses the first or last
 * square, and each spans at least one row.
 */
export function generateBoard(seed: number, snakeCount = 6, ladderCount = 6): BoardLayout {
  const rng = createRng(seed)
  const used = new Set<number>([1, SQUARE_COUNT])

  const place = (goingUp: boolean): Link | undefined => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const low = randomInt(rng, 2, SQUARE_COUNT - BOARD_SIZE - 1)
      const lowRow = rowFromBottom(low)
      const highRow = randomInt(rng, lowRow + 1, Math.min(lowRow + MAX_ROW_SPAN, BOARD_SIZE - 1))
      const high = randomInt(rng, highRow * BOARD_SIZE + 1, highRow * BOARD_SIZE + BOARD_SIZE)
      if (used.has(low) || used.has(high)) continue
      used.add(low)
      used.add(high)
      return goingUp ? { from: low, to: high } : { from: high, to: low }
    }
    return undefined
  }

  const ladders: Link[] = []
  const snakes: Link[] = []
  for (let i = 0; i < Math.max(snakeCount, ladderCount); i++) {
    const ladder = i < ladderCount ? place(true) : undefined
    if (ladder) ladders.push(ladder)
    const snake = i < snakeCount ? place(false) : undefined
    if (snake) snakes.push(snake)
  }
  return { snakes, ladders }
}
