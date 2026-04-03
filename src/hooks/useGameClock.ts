import { useCallback, useEffect, useRef, useState } from 'react'

export interface GameClockConfig {
  timePerPlayer: number    // milliseconds
  incrementPerTurn: number // milliseconds
}

export interface GameClockState {
  player1Time: number          // ms remaining (can go negative)
  player2Time: number          // ms remaining (can go negative)
  activePlayer: 1 | 2 | null  // null = not started or paused
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean          // true when manually ended
  turnCount: [number, number]  // turns taken by each player
}

export interface GameClockActions {
  start: () => void
  switchTurn: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  updateConfig: (config: GameClockConfig) => void
}

const DEFAULT_CONFIG: GameClockConfig = {
  timePerPlayer: 25 * 60 * 1000,  // 25 minutes
  incrementPerTurn: 0,
}

interface MutableState {
  player1Time: number
  player2Time: number
  activePlayer: 1 | 2 | null
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean
  turnCount: [number, number]
}

export function useGameClock(initialConfig?: Partial<GameClockConfig>): GameClockState & { actions: GameClockActions; config: GameClockConfig } {
  const configRef = useRef<GameClockConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  })

  const makeInitialState = (): MutableState => ({
    player1Time: configRef.current.timePerPlayer,
    player2Time: configRef.current.timePerPlayer,
    activePlayer: null,
    isRunning: false,
    isPaused: false,
    isFinished: false,
    turnCount: [0, 0],
  })

  const stateRef = useRef<MutableState>(makeInitialState())
  const lastTickRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [displayState, setDisplayState] = useState<GameClockState>(() => ({
    ...stateRef.current,
  }))

  const syncDisplay = useCallback(() => {
    const s = stateRef.current
    setDisplayState({
      player1Time: s.player1Time,
      player2Time: s.player2Time,
      activePlayer: s.activePlayer,
      isRunning: s.isRunning,
      isPaused: s.isPaused,
      isFinished: s.isFinished,
      turnCount: [...s.turnCount],
    })
  }, [])

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startInterval = useCallback(() => {
    stopInterval()
    lastTickRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const s = stateRef.current
      if (!s.isRunning || s.isPaused || s.activePlayer === null) return

      const now = Date.now()
      const elapsed = now - lastTickRef.current
      lastTickRef.current = now

      if (s.activePlayer === 1) {
        stateRef.current = { ...s, player1Time: s.player1Time - elapsed }
      } else {
        stateRef.current = { ...s, player2Time: s.player2Time - elapsed }
      }

      syncDisplay()
    }, 100)
  }, [stopInterval, syncDisplay])

  const start = useCallback(() => {
    const s = stateRef.current
    if (s.isRunning || s.isFinished) return

    stateRef.current = {
      ...s,
      activePlayer: 1,
      isRunning: true,
      isPaused: false,
    }
    syncDisplay()
    startInterval()
  }, [syncDisplay, startInterval])

  const switchTurn = useCallback(() => {
    const s = stateRef.current
    if (!s.isRunning || s.isPaused || s.activePlayer === null) return

    const increment = configRef.current.incrementPerTurn
    const nextPlayer: 1 | 2 = s.activePlayer === 1 ? 2 : 1
    const newTurnCount: [number, number] = [...s.turnCount]

    // Add increment to the CURRENT player before switching
    if (s.activePlayer === 1) {
      newTurnCount[0] = newTurnCount[0] + 1
      stateRef.current = {
        ...s,
        player1Time: s.player1Time + increment,
        activePlayer: nextPlayer,
        turnCount: newTurnCount,
      }
    } else {
      newTurnCount[1] = newTurnCount[1] + 1
      stateRef.current = {
        ...s,
        player2Time: s.player2Time + increment,
        activePlayer: nextPlayer,
        turnCount: newTurnCount,
      }
    }

    // Reset tick so the new player's clock starts fresh
    lastTickRef.current = Date.now()
    syncDisplay()
  }, [syncDisplay])

  const pause = useCallback(() => {
    const s = stateRef.current
    if (!s.isRunning || s.isPaused) return

    stopInterval()
    stateRef.current = { ...s, isPaused: true, activePlayer: null }
    syncDisplay()
  }, [syncDisplay, stopInterval])

  const resume = useCallback(() => {
    const s = stateRef.current
    if (!s.isRunning || !s.isPaused) return

    // Resume with the player who was last active — track it separately
    // We need to know which player was active before pause
    // Store lastActivePlayer in ref
    const lastActive = lastActivePlayerRef.current ?? 1
    stateRef.current = { ...s, isPaused: false, activePlayer: lastActive }
    syncDisplay()
    startInterval()
  }, [syncDisplay, startInterval])

  const reset = useCallback(() => {
    stopInterval()
    stateRef.current = makeInitialState()
    lastActivePlayerRef.current = null
    syncDisplay()
  }, [stopInterval, syncDisplay]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateConfig = useCallback((config: GameClockConfig) => {
    const s = stateRef.current
    if (s.isRunning) return // can't update while running

    configRef.current = config
    stateRef.current = {
      ...s,
      player1Time: config.timePerPlayer,
      player2Time: config.timePerPlayer,
    }
    syncDisplay()
  }, [syncDisplay])

  // Track the last active player so we can resume correctly
  const lastActivePlayerRef = useRef<1 | 2 | null>(null)

  useEffect(() => {
    const s = stateRef.current
    if (s.activePlayer !== null) {
      lastActivePlayerRef.current = s.activePlayer
    }
  })

  // Also intercept pause to remember active player
  const pauseWithMemory = useCallback(() => {
    const s = stateRef.current
    if (s.activePlayer !== null) {
      lastActivePlayerRef.current = s.activePlayer
    }
    pause()
  }, [pause])

  useEffect(() => {
    return () => {
      stopInterval()
    }
  }, [stopInterval])

  const actions: GameClockActions = {
    start,
    switchTurn,
    pause: pauseWithMemory,
    resume,
    reset,
    updateConfig,
  }

  return {
    ...displayState,
    actions,
    config: configRef.current,
  }
}
