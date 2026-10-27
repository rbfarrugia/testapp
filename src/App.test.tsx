import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  afterEach(cleanup)

  it('renders a board of 100 numbered squares', () => {
    render(<App initialSeed={42} />)
    const squares = screen.getAllByTestId('square')
    expect(squares).toHaveLength(100)
    // The top-left square is 100 and the bottom-left is 1.
    expect(squares[0].textContent).toBe('100')
    expect(squares[90].textContent).toBe('1')
  })

  it('alternates the square colours', () => {
    render(<App initialSeed={42} />)
    const squares = screen.getAllByTestId('square')
    expect(squares[0].className).toContain('square-light')
    expect(squares[1].className).toContain('square-dark')
    expect(squares[10].className).toContain('square-dark')
  })

  it('shows the seed and draws snakes and ladders', () => {
    const { container } = render(<App initialSeed={42} />)
    expect(container.querySelector('.seed')?.textContent).toBe('Seed: 42')
    expect(container.querySelectorAll('.snake')).toHaveLength(6)
    expect(container.querySelectorAll('.ladder')).toHaveLength(6)
  })

  it('shows two dice with a Roll dice button', () => {
    render(<App initialSeed={42} />)
    expect(screen.getAllByRole('img', { name: /^Die showing/ })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Roll dice' })).toBeTruthy()
  })

  it('picks a new seed when Randomise is clicked', () => {
    const { container } = render(<App initialSeed={42} />)
    const seed = () => container.querySelector('.seed strong')?.textContent
    expect(seed()).toBe('42')
    fireEvent.click(screen.getByRole('button', { name: 'Randomise' }))
    expect(seed()).not.toBe('42')
    expect(Number(seed())).toBeGreaterThan(0)
  })
})
