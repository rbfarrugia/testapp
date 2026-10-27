/** A random number generator returning floats in [0, 1). */
export type Rng = () => number

/** Creates a deterministic random number generator (mulberry32) from a seed. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Returns a random integer between min and max, inclusive. */
export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/** Returns a new random seed: a positive whole number different from `previous`. */
export function newSeed(previous?: number): number {
  let seed: number
  do {
    seed = Math.floor(Math.random() * 999_999) + 1
  } while (seed === previous)
  return seed
}
