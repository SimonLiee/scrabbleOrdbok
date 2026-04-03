import { describe, expect, it } from 'vitest'
import { scoreWord } from '../scoring.ts'

describe('scoreWord', () => {
  it('returns 0 for empty string', () => {
    expect(scoreWord('')).toBe(0)
  })

  it('scores single letters correctly', () => {
    expect(scoreWord('a')).toBe(1)
    expect(scoreWord('e')).toBe(1)
    expect(scoreWord('f')).toBe(2)
    expect(scoreWord('h')).toBe(3)
    expect(scoreWord('b')).toBe(4)
    expect(scoreWord('ø')).toBe(5)
    expect(scoreWord('j')).toBe(6)
    expect(scoreWord('y')).toBe(8)
    expect(scoreWord('w')).toBe(10)
    expect(scoreWord('x')).toBe(10)
    expect(scoreWord('z')).toBe(10)
  })

  it('scores Norwegian characters correctly', () => {
    expect(scoreWord('æ')).toBe(6)
    expect(scoreWord('ø')).toBe(5)
    expect(scoreWord('å')).toBe(4)
  })

  it('scores a word by summing letter values', () => {
    expect(scoreWord('ål')).toBe(5)
    expect(scoreWord('is')).toBe(2)
  })

  it('is case-insensitive', () => {
    expect(scoreWord('A')).toBe(1)
    expect(scoreWord('HEST')).toBe(scoreWord('hest'))
  })

  it('returns 0 for unknown characters', () => {
    expect(scoreWord('123')).toBe(0)
  })

  it('scores a typical Norwegian word', () => {
    expect(scoreWord('hest')).toBe(3 + 1 + 1 + 1)
  })

  it('scores word with all Norwegian special chars', () => {
    expect(scoreWord('æøå')).toBe(6 + 5 + 4)
  })
})
