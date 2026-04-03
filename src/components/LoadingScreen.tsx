import { cn } from "@/lib/utils"
import { LETTER_SCORES } from "@/lib/scoring"

export interface LoadingScreenProps {
  progress?: number
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const isComplete = progress === 100
  const appName = "ScrabbleOrdbok"

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-500">
      <div className="flex flex-col items-center w-full max-w-sm px-6 gap-8">
        <h1 className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mb-4">
          {appName.split('').map((letter, i) => (
            <div
              key={`${i}-${letter}`}
              className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#f0e6d2] dark:bg-[#d8c5a1] text-[#3e2723] rounded shadow-md border border-[#d3c2a6] dark:border-[#bda986] font-bold text-xl sm:text-2xl md:text-3xl uppercase select-none"
            >
              <span>{letter}</span>
              <span className="absolute bottom-[2px] right-[2px] sm:bottom-[3px] sm:right-[3px] text-[10px] sm:text-xs leading-none font-medium text-[#5d4037]">
                {LETTER_SCORES[letter.toLowerCase()] ?? 0}
              </span>
            </div>
          ))}
        </h1>

        <div className="w-full space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground animate-pulse">
            {isComplete ? "Ordliste klar" : "Laster ordlisten..."}
          </p>

          <div className="w-full h-2 bg-muted rounded-full overflow-hidden shadow-inner">
            <div
              className={cn(
                "h-full bg-primary transition-all duration-300 ease-in-out",
                progress === undefined ? "w-full animate-pulse" : ""
              )}
              style={progress !== undefined ? { width: `${progress}%` } : undefined}
            />
          </div>

          <div className="text-xs text-center text-muted-foreground/80 mt-6 h-6 font-medium">
            {isComplete && "922 321 ord lastet"}
          </div>
        </div>
      </div>
    </div>
  )
}
