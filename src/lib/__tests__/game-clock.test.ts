// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameClock } from '../../hooks/useGameClock'
import type { GameClockConfig } from '../../hooks/useGameClock'

const DEFAULT_CONFIG: GameClockConfig = {
  timePerPlayer: 25 * 60 * 1000,
  incrementPerTurn: 0,
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useGameClock — initial state', () => {
  it('both players have configured time', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    expect(result.current.player1Time).toBe(DEFAULT_CONFIG.timePerPlayer)
    expect(result.current.player2Time).toBe(DEFAULT_CONFIG.timePerPlayer)
  })

  it('no active player, not running', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    expect(result.current.activePlayer).toBeNull()
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('turn counts start at zero', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    expect(result.current.turnCount[0]).toBe(0)
    expect(result.current.turnCount[1]).toBe(0)
  })
})

describe('useGameClock — start', () => {
  it('player 1 becomes active after start', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    expect(result.current.activePlayer).toBe(1)
  })

  it('clock is running after start', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
  })

  it('calling start twice is a no-op', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.start())
    expect(result.current.activePlayer).toBe(1)
  })
})

describe('useGameClock — time decrements', () => {
  it('player 1 time decreases while active', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    const before = result.current.player1Time

    act(() => vi.advanceTimersByTime(5000))

    expect(result.current.player1Time).toBeLessThan(before)
    expect(before - result.current.player1Time).toBeCloseTo(5000, -2)
  })

  it('player 2 time is unchanged while player 1 is active', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    const before = result.current.player2Time

    act(() => vi.advanceTimersByTime(5000))

    expect(result.current.player2Time).toBe(before)
  })
})

describe('useGameClock — switchTurn', () => {
  it('switches active player', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.switchTurn())
    expect(result.current.activePlayer).toBe(2)
  })

  it('switches back on second call', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.switchTurn())
    act(() => result.current.actions.switchTurn())
    expect(result.current.activePlayer).toBe(1)
  })

  it('increments player 1 turn count', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.switchTurn())
    expect(result.current.turnCount[0]).toBe(1)
    expect(result.current.turnCount[1]).toBe(0)
  })

  it('increments player 2 turn count on their switch', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.switchTurn())
    act(() => result.current.actions.switchTurn())
    expect(result.current.turnCount[0]).toBe(1)
    expect(result.current.turnCount[1]).toBe(1)
  })

  it('adds increment to current player time on switch', () => {
    const config: GameClockConfig = { timePerPlayer: 10_000, incrementPerTurn: 2_000 }
    const { result } = renderHook(() => useGameClock(config))
    act(() => result.current.actions.start())

    act(() => vi.advanceTimersByTime(1000))
    const p1Before = result.current.player1Time
    act(() => result.current.actions.switchTurn())

    expect(result.current.player1Time).toBe(p1Before + 2_000)
  })

  it('no-op when paused', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.pause())
    act(() => result.current.actions.switchTurn())
    expect(result.current.activePlayer).toBeNull()
  })
})

describe('useGameClock — pause/resume', () => {
  it('sets isPaused and clears activePlayer', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.pause())
    expect(result.current.isPaused).toBe(true)
    expect(result.current.activePlayer).toBeNull()
    expect(result.current.isRunning).toBe(true)
  })

  it('time does not decrease while paused', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.pause())
    const timeBefore = result.current.player1Time

    act(() => vi.advanceTimersByTime(5000))

    expect(result.current.player1Time).toBe(timeBefore)
  })

  it('resume restores active player and continues counting', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.pause())
    act(() => result.current.actions.resume())

    expect(result.current.isPaused).toBe(false)
    expect(result.current.activePlayer).toBe(1)

    const before = result.current.player1Time
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.player1Time).toBeLessThan(before)
  })

  it('resume after switch restores correct player', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.switchTurn())
    act(() => result.current.actions.pause())
    act(() => result.current.actions.resume())
    expect(result.current.activePlayer).toBe(2)
  })
})

describe('useGameClock — reset', () => {
  it('returns both players to initial time', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => vi.advanceTimersByTime(10_000))
    act(() => result.current.actions.reset())
    expect(result.current.player1Time).toBe(DEFAULT_CONFIG.timePerPlayer)
    expect(result.current.player2Time).toBe(DEFAULT_CONFIG.timePerPlayer)
  })

  it('clears running state', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.reset())
    expect(result.current.isRunning).toBe(false)
    expect(result.current.activePlayer).toBeNull()
  })

  it('resets turn counts', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    act(() => result.current.actions.switchTurn())
    act(() => result.current.actions.switchTurn())
    act(() => result.current.actions.reset())
    expect(result.current.turnCount[0]).toBe(0)
    expect(result.current.turnCount[1]).toBe(0)
  })
})

describe('useGameClock — negative time (overtime)', () => {
  it('time goes below zero and keeps counting', () => {
    const config: GameClockConfig = { timePerPlayer: 500, incrementPerTurn: 0 }
    const { result } = renderHook(() => useGameClock(config))
    act(() => result.current.actions.start())

    act(() => vi.advanceTimersByTime(2000))

    expect(result.current.player1Time).toBeLessThan(0)
  })
})

describe('useGameClock — updateConfig', () => {
  it('updates times when not running', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.updateConfig({ timePerPlayer: 10 * 60 * 1000, incrementPerTurn: 5000 }))
    expect(result.current.player1Time).toBe(10 * 60 * 1000)
    expect(result.current.player2Time).toBe(10 * 60 * 1000)
  })

  it('ignores update while running', () => {
    const { result } = renderHook(() => useGameClock(DEFAULT_CONFIG))
    act(() => result.current.actions.start())
    const before = result.current.player1Time
    act(() => result.current.actions.updateConfig({ timePerPlayer: 1000, incrementPerTurn: 0 }))
    expect(result.current.player1Time).toBe(before)
  })
})
