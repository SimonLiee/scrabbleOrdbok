import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { GameClock } from '@/components/game/GameClock'
import { GameClockSettings } from '@/components/game/GameClockSettings'
import { GameWordChecker } from '@/components/game/GameWordChecker'
import { useGameClock } from '@/hooks/useGameClock'
import type { GameClockConfig } from '@/hooks/useGameClock'

export function GamePage() {
  const clock = useGameClock()
  const [showSettings, setShowSettings] = useState(false)

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
    setShowSettings(false)
    clock.actions.start()
  }

  function handleReset() {
    clock.actions.reset()
    setShowSettings(false)
  }

  function handleSettingsOpen() {
    clock.actions.pause()
    setShowSettings(true)
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        {!isInGame && !showSettings && (
          <GameClockSettings
            config={clock.config}
            onConfigChange={handleConfigChange}
            onStart={handleStart}
          />
        )}

        {(isInGame || showSettings) && (
          <>
            {showSettings ? (
              <GameClockSettings
                config={clock.config}
                onConfigChange={handleConfigChange}
                onStart={() => {
                  handleReset()
                  handleStart()
                }}
              />
            ) : (
              <GameClock
                state={clock}
                actions={{ ...clock.actions, reset: handleReset }}
                onSettingsOpen={handleSettingsOpen}
              />
            )}

            {!showSettings && (
              <GameWordChecker />
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
