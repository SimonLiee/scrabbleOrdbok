import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Timer } from 'lucide-react'
import type { GameClockConfig } from '@/hooks/useGameClock'

interface GameClockSettingsProps {
  config: GameClockConfig
  onConfigChange: (config: GameClockConfig) => void
  onConfirm: () => void
}

const TIME_PRESETS = [15, 20, 25, 30, 45] as const
const INCREMENT_PRESETS = [0, 5, 10, 15, 30] as const

function msToMinutes(ms: number): number {
  return Math.round(ms / 60_000)
}

function minutesToMs(min: number): number {
  return min * 60_000
}

function msToSeconds(ms: number): number {
  return Math.round(ms / 1000)
}

function secondsToMs(sec: number): number {
  return sec * 1000
}

export function GameClockSettings({ config, onConfigChange, onConfirm }: GameClockSettingsProps) {
  const currentMinutes = msToMinutes(config.timePerPlayer)
  const currentIncSec = msToSeconds(config.incrementPerTurn)

  const matchedTimePreset = TIME_PRESETS.includes(currentMinutes as typeof TIME_PRESETS[number])
    ? String(currentMinutes)
    : 'custom'

  const matchedIncPreset = INCREMENT_PRESETS.includes(currentIncSec as typeof INCREMENT_PRESETS[number])
    ? String(currentIncSec)
    : null

  const [isCustomTime, setIsCustomTime] = useState(matchedTimePreset === 'custom')
  const [customMinutes, setCustomMinutes] = useState(
    matchedTimePreset === 'custom' ? String(currentMinutes) : ''
  )

  const [isCustomIncrement, setIsCustomIncrement] = useState(matchedIncPreset === null)
  const [customSeconds, setCustomSeconds] = useState(
    matchedIncPreset === null ? String(currentIncSec) : ''
  )

  function handleTimePreset(value: string[]) {
    const last = value[value.length - 1]
    if (!last) return
    if (last === 'custom') {
      setIsCustomTime(true)
      setCustomMinutes(String(currentMinutes))
      return
    }
    setIsCustomTime(false)
    const minutes = parseInt(last, 10)
    if (!isNaN(minutes) && minutes > 0) {
      onConfigChange({ ...config, timePerPlayer: minutesToMs(minutes) })
    }
  }

  function handleCustomTime(raw: string) {
    setCustomMinutes(raw)
    const minutes = parseInt(raw, 10)
    if (!isNaN(minutes) && minutes > 0 && minutes <= 120) {
      onConfigChange({ ...config, timePerPlayer: minutesToMs(minutes) })
    }
  }

  function handleIncrement(value: string[]) {
    const last = value[value.length - 1]
    if (last === undefined) return
    if (last === 'custom') {
      setIsCustomIncrement(true)
      setCustomSeconds(String(currentIncSec))
      return
    }
    setIsCustomIncrement(false)
    const sec = parseInt(last, 10)
    if (!isNaN(sec)) {
      onConfigChange({ ...config, incrementPerTurn: secondsToMs(sec) })
    }
  }

  function handleCustomIncrement(raw: string) {
    setCustomSeconds(raw)
    const sec = parseInt(raw, 10)
    if (!isNaN(sec) && sec >= 0 && sec <= 300) {
      onConfigChange({ ...config, incrementPerTurn: secondsToMs(sec) })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="size-4 text-primary" />
          Spillklokke
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-foreground">
            Tid per spiller
          </Label>
          <ToggleGroup
            value={[isCustomTime ? 'custom' : matchedTimePreset]}
            onValueChange={handleTimePreset}
            variant="outline"
            spacing={1}
            className="flex-wrap gap-1.5"
          >
            {TIME_PRESETS.map((min) => (
              <ToggleGroupItem
                key={min}
                value={String(min)}
                className="h-9 px-4 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {min} min
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem
              value="custom"
              className="h-9 px-4 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Egen
            </ToggleGroupItem>
          </ToggleGroup>

          {isCustomTime && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={120}
                value={customMinutes}
                onChange={(e) => handleCustomTime(e.target.value)}
                className="w-24 h-9 text-center"
                placeholder="min"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-foreground">
            Tilleggstid per tur
          </Label>
          <ToggleGroup
            value={[isCustomIncrement ? 'custom' : (matchedIncPreset ?? 'custom')]}
            onValueChange={handleIncrement}
            variant="outline"
            spacing={1}
            className="flex-wrap gap-1.5"
          >
            {INCREMENT_PRESETS.map((sec) => (
              <ToggleGroupItem
                key={sec}
                value={String(sec)}
                className="h-9 px-4 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {sec === 0 ? '0 sek' : `+${sec} sek`}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem
              value="custom"
              className="h-9 px-4 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Egen
            </ToggleGroupItem>
          </ToggleGroup>

          {isCustomIncrement && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={300}
                value={customSeconds}
                onChange={(e) => handleCustomIncrement(e.target.value)}
                className="w-24 h-9 text-center"
                placeholder="sek"
              />
              <span className="text-sm text-muted-foreground">sek</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>{currentMinutes} min per spiller</span>
            {currentIncSec > 0 && <span>+{currentIncSec} sek per tur</span>}
          </div>
          <Button
            onClick={onConfirm}
            size="lg"
            className="w-full h-12 text-base font-bold tracking-wide gap-2"
          >
            <Timer className="size-5" />
            Velg tidskontroll
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
