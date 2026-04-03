import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SearchPage } from '@/pages/SearchPage'
import { GamePage } from '@/pages/GamePage'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="scrabble-ui-theme">
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/spill" element={<GamePage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
