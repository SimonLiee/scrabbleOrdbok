import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

interface ClockConfig {
  timePerPlayer: number
  incrementPerTurn: number
}

interface ClockState {
  player1Time: number
  player2Time: number
  activePlayer: 1 | 2 | null
  isRunning: boolean
  isPaused: boolean
  turnCount: [number, number]
}

class GameClockEngine {
  private state: ClockState
  private config: ClockConfig
  private lastTick: number = 0
  private tickInterval: ReturnType<typeof setInterval> | null = null
  private lastActivePlayer: 1 | 2 = 1

  constructor(config: ClockConfig) {
    this.config = config
    this.state = this.makeInitial()
  }

  private makeInitial(): ClockState {
    return {
      player1Time: this.config.timePerPlayer,
      player2Time: this.config.timePerPlayer,
      activePlayer: null,
      isRunning: false,
      isPaused: false,
      turnCount: [0, 0],
    }
  }

  getState(): Readonly<ClockState> {
    return { ...this.state, turnCount: [...this.state.turnCount] as [number, number] }
  }

  start() {
    if (this.state.isRunning) return
    this.state = { ...this.state, activePlayer: 1, isRunning: true, isPaused: false }
    this.lastTick = Date.now()
    this.startInterval()
  }

  tick() {
    const s = this.state
    if (!s.isRunning || s.isPaused || s.activePlayer === null) return
    const now = Date.now()
    const elapsed = now - this.lastTick
    this.lastTick = now
    if (s.activePlayer === 1) {
      this.state = { ...s, player1Time: s.player1Time - elapsed }
    } else {
      this.state = { ...s, player2Time: s.player2Time - elapsed }
    }
  }

  switchTurn() {
    const s = this.state
    if (!s.isRunning || s.isPaused || s.activePlayer === null) return
    const inc = this.config.incrementPerTurn
    const next: 1 | 2 = s.activePlayer === 1 ? 2 : 1
    const newCount: [number, number] = [...s.turnCount] as [number, number]
    if (s.activePlayer === 1) {
      newCount[0]++
      this.state = { ...s, player1Time: s.player1Time + inc, activePlayer: next, turnCount: newCount }
    } else {
      newCount[1]++
      this.state = { ...s, player2Time: s.player2Time + inc, activePlayer: next, turnCount: newCount }
    }
    this.lastTick = Date.now()
  }

  pause() {
    const s = this.state
    if (!s.isRunning || s.isPaused) return
    if (s.activePlayer !== null) this.lastActivePlayer = s.activePlayer
    this.stopInterval()
    this.state = { ...s, isPaused: true, activePlayer: null }
  }

  resume() {
    const s = this.state
    if (!s.isRunning || !s.isPaused) return
    this.state = { ...s, isPaused: false, activePlayer: this.lastActivePlayer }
    this.lastTick = Date.now()
    this.startInterval()
  }

  reset() {
    this.stopInterval()
    this.state = this.makeInitial()
  }

  updateConfig(config: ClockConfig) {
    if (this.state.isRunning) return
    this.config = config
    this.state = { ...this.state, player1Time: config.timePerPlayer, player2Time: config.timePerPlayer }
  }

  private startInterval() {
    this.stopInterval()
    this.tickInterval = setInterval(() => this.tick(), 100)
  }

  private stopInterval() {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
  }

  dispose() {
    this.stopInterval()
  }
}

const DEFAULT_CONFIG: ClockConfig = {
  timePerPlayer: 25 * 60 * 1000,
  incrementPerTurn: 0,
}

let engine: GameClockEngine

beforeEach(() => {
  vi.useFakeTimers()
  engine = new GameClockEngine(DEFAULT_CONFIG)
})

afterEach(() => {
  engine.dispose()
  vi.useRealTimers()
})

describe('GameClockEngine — initial state', () => {
  it('both players have configured time', () => {
    const s = engine.getState()
    expect(s.player1Time).toBe(DEFAULT_CONFIG.timePerPlayer)
    expect(s.player2Time).toBe(DEFAULT_CONFIG.timePerPlayer)
  })

  it('no active player, not running', () => {
    const s = engine.getState()
    expect(s.activePlayer).toBeNull()
    expect(s.isRunning).toBe(false)
    expect(s.isPaused).toBe(false)
  })

  it('turn counts start at zero', () => {
    const s = engine.getState()
    expect(s.turnCount[0]).toBe(0)
    expect(s.turnCount[1]).toBe(0)
  })
})

describe('GameClockEngine — start', () => {
  it('player 1 becomes active after start', () => {
    engine.start()
    expect(engine.getState().activePlayer).toBe(1)
  })

  it('clock is running after start', () => {
    engine.start()
    expect(engine.getState().isRunning).toBe(true)
    expect(engine.getState().isPaused).toBe(false)
  })

  it('calling start twice is a no-op', () => {
    engine.start()
    engine.start()
    expect(engine.getState().activePlayer).toBe(1)
  })
})

describe('GameClockEngine — time decrements', () => {
  it('player 1 time decreases while active', () => {
    engine.start()
    const before = engine.getState().player1Time

    vi.advanceTimersByTime(5000)

    const after = engine.getState().player1Time
    expect(after).toBeLessThan(before)
    expect(before - after).toBeCloseTo(5000, -2)
  })

  it('player 2 time is unchanged while player 1 is active', () => {
    engine.start()
    const before = engine.getState().player2Time

    vi.advanceTimersByTime(5000)

    expect(engine.getState().player2Time).toBe(before)
  })
})

describe('GameClockEngine — switchTurn', () => {
  it('switches active player', () => {
    engine.start()
    engine.switchTurn()
    expect(engine.getState().activePlayer).toBe(2)
  })

  it('switches back on second call', () => {
    engine.start()
    engine.switchTurn()
    engine.switchTurn()
    expect(engine.getState().activePlayer).toBe(1)
  })

  it('increments player 1 turn count', () => {
    engine.start()
    engine.switchTurn()
    expect(engine.getState().turnCount[0]).toBe(1)
    expect(engine.getState().turnCount[1]).toBe(0)
  })

  it('increments player 2 turn count on their switch', () => {
    engine.start()
    engine.switchTurn()
    engine.switchTurn()
    expect(engine.getState().turnCount[0]).toBe(1)
    expect(engine.getState().turnCount[1]).toBe(1)
  })

  it('adds increment to current player time on switch', () => {
    const engineWithInc = new GameClockEngine({ timePerPlayer: 10_000, incrementPerTurn: 2_000 })
    engineWithInc.start()

    vi.advanceTimersByTime(1000)
    const p1Before = engineWithInc.getState().player1Time
    engineWithInc.switchTurn()

    expect(engineWithInc.getState().player1Time).toBe(p1Before + 2_000)
    engineWithInc.dispose()
  })

  it('no-op when paused', () => {
    engine.start()
    engine.pause()
    engine.switchTurn()
    expect(engine.getState().activePlayer).toBeNull()
  })
})

describe('GameClockEngine — pause/resume', () => {
  it('sets isPaused and clears activePlayer', () => {
    engine.start()
    engine.pause()
    expect(engine.getState().isPaused).toBe(true)
    expect(engine.getState().activePlayer).toBeNull()
    expect(engine.getState().isRunning).toBe(true)
  })

  it('time does not decrease while paused', () => {
    engine.start()
    engine.pause()
    const timeBefore = engine.getState().player1Time

    vi.advanceTimersByTime(5000)

    expect(engine.getState().player1Time).toBe(timeBefore)
  })

  it('resume restores active player and continues counting', () => {
    engine.start()
    engine.pause()
    engine.resume()

    expect(engine.getState().isPaused).toBe(false)
    expect(engine.getState().activePlayer).toBe(1)

    const before = engine.getState().player1Time
    vi.advanceTimersByTime(1000)
    expect(engine.getState().player1Time).toBeLessThan(before)
  })

  it('resume after switch restores correct player', () => {
    engine.start()
    engine.switchTurn()
    engine.pause()
    engine.resume()
    expect(engine.getState().activePlayer).toBe(2)
  })
})

describe('GameClockEngine — reset', () => {
  it('returns both players to initial time', () => {
    engine.start()
    vi.advanceTimersByTime(10_000)
    engine.reset()
    expect(engine.getState().player1Time).toBe(DEFAULT_CONFIG.timePerPlayer)
    expect(engine.getState().player2Time).toBe(DEFAULT_CONFIG.timePerPlayer)
  })

  it('clears running state', () => {
    engine.start()
    engine.reset()
    expect(engine.getState().isRunning).toBe(false)
    expect(engine.getState().activePlayer).toBeNull()
  })

  it('resets turn counts', () => {
    engine.start()
    engine.switchTurn()
    engine.switchTurn()
    engine.reset()
    expect(engine.getState().turnCount[0]).toBe(0)
    expect(engine.getState().turnCount[1]).toBe(0)
  })
})

describe('GameClockEngine — negative time (overtime)', () => {
  it('time goes below zero and keeps counting', () => {
    const shortEngine = new GameClockEngine({ timePerPlayer: 500, incrementPerTurn: 0 })
    shortEngine.start()

    vi.advanceTimersByTime(2000)

    expect(shortEngine.getState().player1Time).toBeLessThan(0)
    shortEngine.dispose()
  })
})

describe('GameClockEngine — updateConfig', () => {
  it('updates times when not running', () => {
    engine.updateConfig({ timePerPlayer: 10 * 60 * 1000, incrementPerTurn: 5000 })
    expect(engine.getState().player1Time).toBe(10 * 60 * 1000)
    expect(engine.getState().player2Time).toBe(10 * 60 * 1000)
  })

  it('ignores update while running', () => {
    engine.start()
    const before = engine.getState().player1Time
    engine.updateConfig({ timePerPlayer: 1000, incrementPerTurn: 0 })
    expect(engine.getState().player1Time).toBe(before)
  })
})
