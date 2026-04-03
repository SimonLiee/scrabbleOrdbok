import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { GameClock } from '@/components/game/GameClock'
import { GameClockSettings } from '@/components/game/GameClockSettings'
import { GameWordChecker } from '@/components/game/GameWordChecker'
import { useGameClock } from '@/hooks/useGameClock'
import type { GameClockConfig } from '@/hooks/useGameClock'

export function GamePage() {
  const clock = useGameClock()

  const isInGame = clock.isRunning || clock.isPaused

  useEffect(() => {
    document.title = 'Spillklokke - Bok Stavern'
    return () => {
      document.title = 'Bok Stavern'
    }
  }, [])

  function handleConfigChange(config: GameClockConfig) {
    clock.actions.updateConfig(config)
  }

  function handleStart() {
    clock.actions.start()
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        {!isInGame ? (
          <GameClockSettings
            config={clock.config}
            onConfigChange={handleConfigChange}
            onStart={handleStart}
          />
        ) : (
          <>
            <GameClock
              state={clock}
              actions={clock.actions}
            />
            <GameWordChecker />
          </>
        )}
      </div>
    </Layout>
  )
}
