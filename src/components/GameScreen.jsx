import { useEffect } from 'react'
import useGameStore from '../store/gameStore'
import Board from './Board'
import GameHUD from './GameHUD'
import Dice from './Dice'
import GameLog from './GameLog'
import ShopModal from './ShopModal'
import EventModal from './EventModal'
import GameOverScreen from './GameOverScreen'

export default function GameScreen({ onBackToTitle }) {
  const phase = useGameStore((s) => s.phase)
  const activeShop = useGameStore((s) => s.activeShop)
  const activeEvent = useGameStore((s) => s.activeEvent)

  if (phase === 'gameover') {
    return <GameOverScreen onBackToTitle={onBackToTitle} />
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #FDF3DC 50%, #F9ECC8 100%)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Top bar */}
      <header
        className="flex-shrink-0 px-4 py-2 flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, #1a1a2e 0%, #0d1b4b 100%)',
          borderBottom: '3px solid #E85D04',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-black" style={{
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #FFD700, #FF9500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>ます鉄</span>
          <span className="text-xs opacity-50 hidden sm:block"
            style={{ color: 'rgba(255,248,230,0.6)' }}>
            益田市をめぐる旅
          </span>
        </div>
        <button
          onClick={onBackToTitle}
          className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-100"
          style={{
            color: 'rgba(255,248,230,0.6)',
            border: '1px solid rgba(255,248,230,0.2)',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,248,230,0.95)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,248,230,0.6)'
          }}
        >
          タイトルへ
        </button>
      </header>

      {/* Main layout: 2-column on desktop, stacked on mobile */}
      <div
        className="flex-1 grid overflow-hidden"
        style={{
          gridTemplateColumns: 'minmax(240px, 300px) 1fr',
          gridTemplateRows: '1fr',
          gap: 0,
          minHeight: 0,
        }}
      >
        {/* Left panel: HUD + Dice + Log */}
        <div
          className="flex flex-col gap-0 overflow-y-auto"
          style={{
            borderRight: '2px solid rgba(26,26,46,0.12)',
            background: 'rgba(255,255,255,0.5)',
          }}
        >
          {/* Player HUD */}
          <div className="flex-shrink-0 p-3 border-b"
            style={{ borderColor: 'rgba(26,26,46,0.1)' }}>
            <GameHUD />
          </div>

          {/* Dice area */}
          <div className="flex-shrink-0 p-3 border-b"
            style={{ borderColor: 'rgba(26,26,46,0.1)' }}>
            <Dice />
          </div>

          {/* Game log */}
          <div className="flex-1 min-h-0 p-3">
            <GameLog />
          </div>
        </div>

        {/* Right panel: Board */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ background: '#F5ECD7', minHeight: '400px' }}
        >
          <Board />
        </div>
      </div>

      {/* Modals */}
      {activeShop && <ShopModal />}
      {activeEvent && <EventModal />}
    </div>
  )
}
