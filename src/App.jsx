import { useState, useEffect } from 'react'
import TitleScreen from './components/TitleScreen'
import SetupScreen from './components/SetupScreen'
import GameScreen from './components/GameScreen'
import useGameStore from './store/gameStore'

// Screen IDs
const SCREENS = {
  TITLE: 'title',
  SETUP: 'setup',
  GAME: 'game',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.TITLE)
  const phase = useGameStore((s) => s.phase)

  // If the store resets to waiting from gameover, go back to title
  useEffect(() => {
    if (phase === 'waiting' && screen === 'game') {
      setScreen(SCREENS.TITLE)
    }
  }, [phase, screen])

  const goToSetup = () => setScreen(SCREENS.SETUP)
  const goToGame  = () => setScreen(SCREENS.GAME)
  const goToTitle = () => setScreen(SCREENS.TITLE)

  return (
    <div className="min-h-screen">
      {screen === SCREENS.TITLE && (
        <TitleScreen onStart={goToSetup} />
      )}
      {screen === SCREENS.SETUP && (
        <SetupScreen onStart={goToGame} onBack={goToTitle} />
      )}
      {screen === SCREENS.GAME && (
        <GameScreen onBackToTitle={goToTitle} />
      )}
    </div>
  )
}
