import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Dice, { ROLL_MS } from './Dice.tsx'
import { createRng } from './random.ts'

const dieValues = () => screen.getAllByRole('img').map((die) => Number(die.dataset.value))

describe('Dice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows two dice, each a cube with six faces', () => {
    const { container } = render(<Dice />)
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(container.querySelectorAll('.die-face')).toHaveLength(12)
    // Each face has as many pips as its number: 1 + 2 + ... + 6 = 21.
    expect(container.querySelectorAll('.die .pip')).toHaveLength(42)
    expect(dieValues()).toEqual([1, 1])
  })

  it('rolls new values with a short animation', () => {
    const { container } = render(<Dice rng={createRng(7)} />)
    const button = screen.getByRole('button', { name: 'Roll dice' })
    const cube = () => (container.querySelector('.die-cube') as HTMLElement).style.transform
    const before = cube()

    fireEvent.click(button)
    expect(container.querySelector('.dice-rolling')).not.toBeNull()
    expect(button).toHaveProperty('disabled', true)
    expect(cube()).not.toBe(before)

    act(() => {
      vi.advanceTimersByTime(ROLL_MS)
    })
    expect(container.querySelector('.dice-rolling')).toBeNull()
    expect(button).toHaveProperty('disabled', false)
    const [a, b] = dieValues()
    expect(container.querySelector('.dice-total')?.textContent).toBe(`Rolled ${a} and ${b}`)
  })

  it('always rolls values from 1 to 6', () => {
    render(<Dice rng={createRng(99)} />)
    const button = screen.getByRole('button', { name: 'Roll dice' })
    const seen = new Set<number>()
    for (let i = 0; i < 50; i++) {
      fireEvent.click(button)
      act(() => {
        vi.advanceTimersByTime(ROLL_MS)
      })
      for (const value of dieValues()) {
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(6)
        seen.add(value)
      }
    }
    expect(seen.size).toBe(6)
  })
})
