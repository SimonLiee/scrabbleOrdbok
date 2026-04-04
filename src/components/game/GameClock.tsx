import { Play, Pause, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { GameClockState, GameClockActions } from '@/hooks/useGameClock'

interface GameClockProps {
  state: GameClockState
  actions: GameClockActions
}

function formatTime(ms: number): string {
  const negative = ms < 0
  const abs = Math.abs(ms)
  const totalSeconds = Math.floor(abs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${negative ? '-' : ''}${pad(minutes)}:${pad(seconds)}`
}

interface PlayerTimerProps {
  label: string
  timeMs: number
  turnCount: number
  isActive: boolean
  isRunning: boolean
}

function PlayerTimer({ label, timeMs, turnCount, isActive, isRunning }: PlayerTimerProps) {
  const isNegative = timeMs < 0
  const isWarning = !isNegative && timeMs < 60_000
  const isOvertime = isNegative

  const timeColor = isOvertime
    ? 'text-red-500 dark:text-red-400'
    : isWarning
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-[#3e2723] dark:text-[#3e2723]'

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-3 rounded-xl p-6 sm:p-8 flex-1 min-w-0 transition-all duration-200
        bg-[#f0e6d2] dark:bg-[#d8c5a1]
        border-2
        ${isActive && isRunning
          ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
          : 'border-[#d3c2a6] dark:border-[#bda986]'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#5d4037] uppercase tracking-wide">
          {label}
        </span>
        {isActive && isRunning && (
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>

      <div
        className={`font-mono font-bold tabular-nums leading-none transition-colors ${timeColor}`}
        style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}
      >
        {formatTime(timeMs)}
      </div>

      <Badge
        variant="secondary"
        className="text-xs px-2 py-0.5 bg-[#d3c2a6]/60 dark:bg-[#bda986]/60 text-[#5d4037] border-0"
      >
        Tur {turnCount}
      </Badge>
    </div>
  )
}

export function GameClock({ state, actions }: GameClockProps) {
  const {
    player1Time,
    player2Time,
    activePlayer,
    isRunning,
    isPaused,
    turnCount,
  } = state

  const canSwitch = isRunning && !isPaused && activePlayer !== null
  const isReady = !isRunning && !isPaused

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <PlayerTimer
            label="Spiller 1"
            timeMs={player1Time}
            turnCount={turnCount[0]}
            isActive={activePlayer === 1}
            isRunning={isRunning && !isPaused}
          />
          <PlayerTimer
            label="Spiller 2"
            timeMs={player2Time}
            turnCount={turnCount[1]}
            isActive={activePlayer === 2}
            isRunning={isRunning && !isPaused}
          />
        </div>

        {isReady ? (
          <Button
            onClick={actions.start}
            size="lg"
            className="w-full h-14 text-base font-bold tracking-wide gap-2"
          >
            <Play className="size-5" />
            Start klokke
          </Button>
        ) : (
          <Button
            onClick={actions.switchTurn}
            disabled={!canSwitch}
            size="lg"
            className="w-full h-14 text-base font-bold tracking-wide"
          >
            Bytt tur
          </Button>
        )}

        <div className="flex gap-2">
          {!isPaused ? (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.pause}
              disabled={!isRunning}
              className="gap-1.5"
            >
              <Pause className="size-4" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.resume}
              className="gap-1.5"
            >
              <Play className="size-4" />
              Fortsett
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={actions.reset}
            className="gap-1.5"
          >
            <RotateCcw className="size-4" />
            Nullstill
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
