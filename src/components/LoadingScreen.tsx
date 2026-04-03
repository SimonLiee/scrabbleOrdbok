import { cn } from "@/lib/utils"

export interface LoadingScreenProps {
  progress?: number
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const isComplete = progress === 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-500">
      <div className="flex flex-col items-center w-full max-w-sm px-6 gap-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4 text-center">
          ScrabbleOrdbok
        </h1>

        <div className="w-full space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground animate-pulse">
            {isComplete ? "Ordliste klar" : "Laster ordlisten..."}
          </p>

          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-primary transition-all duration-300 ease-in-out",
                progress === undefined ? "w-full animate-pulse" : ""
              )}
              style={progress !== undefined ? { width: `${progress}%` } : undefined}
            />
          </div>

          <div className="text-xs text-center text-muted-foreground/80 mt-6 h-6">
            {isComplete && "922 321 ord lastet"}
          </div>
        </div>
      </div>
    </div>
  )
}
