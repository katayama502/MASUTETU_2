import { useEffect, useCallback } from 'react'
import useGameStore from '../store/gameStore'
import Board from './Board'
import GameHUD from './GameHUD'
import Dice from './Dice'
import GameLog from './GameLog'
import ShopModal from './ShopModal'
import EventModal from './EventModal'
import ItemModal from './ItemModal'
import GameOverScreen from './GameOverScreen'

export default function GameScreen({ onBackToTitle }) {
  const phase = useGameStore((s) => s.phase)
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const activeShop = useGameStore((s) => s.activeShop)
  const activeEvent = useGameStore((s) => s.activeEvent)
  const activeItem = useGameStore((s) => s.activeItem)

  const rollDice    = useGameStore((s) => s.rollDice)
  const dismissShop  = useGameStore((s) => s.dismissShop)
  const dismissEvent = useGameStore((s) => s.dismissEvent)
  const dismissItem  = useGameStore((s) => s.dismissItem)

  const currentPlayer = players[currentPlayerIndex]
  const isBot = currentPlayer?.isBot ?? false

  // ── Bot AI: auto-advance through all phases ──────────────────────────────

  // Bot rolls dice automatically
  useEffect(() => {
    if (phase === 'rolling' && isBot) {
      const t = setTimeout(() => rollDice(), 1400)
      return () => clearTimeout(t)
    }
  }, [phase, isBot, rollDice])

  // Bot auto-dismisses shop modal
  useEffect(() => {
    if (phase === 'shop' && isBot) {
      const t = setTimeout(() => dismissShop(), 1800)
      return () => clearTimeout(t)
    }
  }, [phase, isBot, dismissShop])

  // Bot auto-dismisses event modal
  useEffect(() => {
    if (phase === 'event' && isBot) {
      const t = setTimeout(() => dismissEvent(), 1600)
      return () => clearTimeout(t)
    }
  }, [phase, isBot, dismissEvent])

  // Bot auto-dismisses item modal
  useEffect(() => {
    if (phase === 'item' && isBot) {
      const t = setTimeout(() => dismissItem(), 1400)
      return () => clearTimeout(t)
    }
  }, [phase, isBot, dismissItem])

  // ── Render ────────────────────────────────────────────────────────────────

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
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-black"
            style={{
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #FFD700, #FF9500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ます鉄
          </span>
          <span
            className="text-xs hidden sm:block"
            style={{ color: 'rgba(255,248,230,0.5)' }}
          >
            益田市をめぐる旅
          </span>
          {/* Phase badge */}
          <PhaseBadge phase={phase} />
        </div>

        <button
          onClick={onBackToTitle}
          className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
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

      {/* Main layout */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(230px, 280px) 1fr',
          minHeight: 0,
        }}
      >
        {/* Left panel */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            borderRight: '2px solid rgba(26,26,46,0.12)',
            background: 'rgba(255,255,255,0.55)',
          }}
        >
          <div className="p-3 border-b" style={{ borderColor: 'rgba(26,26,46,0.1)' }}>
            <GameHUD />
          </div>
          <div className="p-3 border-b" style={{ borderColor: 'rgba(26,26,46,0.1)' }}>
            <Dice />
          </div>
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

      {/* Modals — only show for human player turns, bots see them briefly then auto-close */}
      {activeShop  && <ShopModal />}
      {activeEvent && <EventModal />}
      {activeItem  && <ItemModal />}
    </div>
  )
}

function PhaseBadge({ phase }) {
  const config = {
    rolling: { label: 'サイコロを振ろう', color: '#FFD700' },
    moving:  { label: '移動中…',         color: '#87CEEB' },
    landing: { label: 'マスに到着',       color: '#90EE90' },
    shop:    { label: 'お店情報',         color: '#FFB347' },
    event:   { label: 'イベント発生！',   color: '#DDA0DD' },
    item:    { label: 'アイテム取得！',   color: '#98FB98' },
  }
  const c = config[phase]
  if (!c) return null
  return (
    <div
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        background: `${c.color}22`,
        color: c.color,
        border: `1px solid ${c.color}55`,
        fontFamily: 'var(--font-body)',
      }}
    >
      {c.label}
    </div>
  )
}
