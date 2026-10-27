import { describe, expect, it } from 'vitest'
import { generateBoard, rowFromBottom, squareAt, squarePosition } from './boardLayout.ts'

describe('squarePosition', () => {
  it('numbers from the bottom left, back and forth', () => {
    expect(squarePosition(1)).toEqual({ row: 9, col: 0 })
    expect(squarePosition(10)).toEqual({ row: 9, col: 9 })
    expect(squarePosition(11)).toEqual({ row: 8, col: 9 })
    expect(squarePosition(20)).toEqual({ row: 8, col: 0 })
    expect(squarePosition(100)).toEqual({ row: 0, col: 0 })
  })

  it('is the inverse of squareAt', () => {
    for (let square = 1; square <= 100; square++) {
      const { row, col } = squarePosition(square)
      expect(squareAt(row, col)).toBe(square)
    }
  })
})

describe('generateBoard', () => {
  it('gives the same layout for the same seed', () => {
    expect(generateBoard(1234)).toEqual(generateBoard(1234))
  })

  it('gives different layouts for different seeds', () => {
    expect(generateBoard(1)).not.toEqual(generateBoard(2))
  })

  it('places valid snakes and ladders', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { snakes, ladders } = generateBoard(seed)
      expect(snakes).toHaveLength(6)
      expect(ladders).toHaveLength(6)

      const ends = [...snakes, ...ladders].flatMap((link) => [link.from, link.to])
      expect(new Set(ends).size).toBe(ends.length)
      for (const end of ends) {
        expect(end).toBeGreaterThan(1)
        expect(end).toBeLessThan(100)
      }
      for (const snake of snakes) {
        expect(rowFromBottom(snake.from)).toBeGreaterThan(rowFromBottom(snake.to))
      }
      for (const ladder of ladders) {
        expect(rowFromBottom(ladder.to)).toBeGreaterThan(rowFromBottom(ladder.from))
      }
    }
  })
})
