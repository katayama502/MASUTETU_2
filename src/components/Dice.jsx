import { useState, useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'
import boardData from '../data/board.json'

// Pip layouts for each face value
const PIP_LAYOUTS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
}

function DiceFace({ value, size = 84, rolling = false }) {
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1]
  const pipSize = Math.round(size * 0.14)
  const pad = Math.round(size * 0.14)

  return (
    <div
      className="dice-face relative select-none"
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)',
        padding: pad,
        gap: 2,
        animation: rolling ? 'diceRoll 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        // 3D-style using layered box-shadows
        background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
        borderRadius: 16,
        boxShadow: `
          inset -4px -4px 8px rgba(0,0,0,0.15),
          inset 4px 4px 8px rgba(255,255,255,0.9),
          6px 6px 16px rgba(0,0,0,0.28),
          -2px -2px 8px rgba(255,255,255,0.5)
        `,
        border: '2px solid #ddd',
      }}
    >
      {Array.from({ length: 9 }).map((_, cellIdx) => {
        const row = Math.floor(cellIdx / 3)
        const col = cellIdx % 3
        const hasPip = pips.some(([r, c]) => r === row && c === col)
        return (
          <div key={cellIdx} className="flex items-center justify-center">
            {hasPip && (
              <div
                style={{
                  width: pipSize,
                  height: pipSize,
                  background: 'radial-gradient(circle at 35% 35%, #3a3a5a, #1a1a2e)',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.2)',
                  animation: rolling ? 'numberFlicker 0.12s ease-in-out infinite' : 'none',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function getSquareName(squareId) {
  if (!squareId) return null
  const sq = boardData?.squares?.find((s) => s.id === squareId)
  return sq?.label || sq?.shortLabel || null
}

export default function Dice() {
  const phase = useGameStore((s) => s.phase)
  const diceResult = useGameStore((s) => s.diceResult)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const players = useGameStore((s) => s.players)
  const rollDice = useGameStore((s) => s.rollDice)

  const [displayValue, setDisplayValue] = useState(1)
  const [rolling, setRolling] = useState(false)
  const [justRolled, setJustRolled] = useState(false)
  const rollInterval = useRef(null)
  const prevResult = useRef(null)

  const currentPlayer = players[currentPlayerIndex]
  const canRoll = phase === 'rolling' && !rolling && currentPlayer && !currentPlayer.isBot

  const destName = getSquareName(currentPlayer?.destination)

  // Animate when dice result changes
  useEffect(() => {
    if (diceResult !== null && diceResult !== prevResult.current) {
      prevResult.current = diceResult
      setRolling(true)
      setJustRolled(false)

      let count = 0
      rollInterval.current = setInterval(() => {
        setDisplayValue(Math.ceil(Math.random() * 6))
        count++
        if (count >= 12) {
          clearInterval(rollInterval.current)
          setDisplayValue(diceResult)
          setRolling(false)
          setJustRolled(true)
          setTimeout(() => setJustRolled(false), 2500)
        }
      }, 65)
    }
    return () => clearInterval(rollInterval.current)
  }, [diceResult])

  const handleRoll = () => {
    if (!canRoll) return
    setRolling(true)
    setJustRolled(false)
    let count = 0
    rollInterval.current = setInterval(() => {
      setDisplayValue(Math.ceil(Math.random() * 6))
      count++
    }, 65)
    setTimeout(() => {
      clearInterval(rollInterval.current)
      rollDice()
    }, 200)
  }

  const phaseLabel = () => {
    if (rolling) return 'ころころ…'
    if (phase === 'rolling') {
      if (currentPlayer?.isBot) return `${currentPlayer.name} がさいころを振っています…`
      return 'さいころを振ってください！'
    }
    if (phase === 'moving') return '移動中…'
    if (phase === 'landing') return 'マスに着地！'
    if (phase === 'event') return 'イベント発生！'
    if (phase === 'buy_property') return '物件購入を検討中…'
    if (phase === 'destination_reached') return '目的地到達！🎯'
    if (phase === 'year_end') return '年度終了！'
    if (phase === 'gameover') return 'ゲーム終了'
    return '順番を待っています'
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="text-xs font-bold tracking-widest text-center"
        style={{ color: '#8b6914', fontFamily: 'var(--font-heading)' }}
      >
        ─ さいころ ─
      </div>

      {/* Dice display with 3D look */}
      <div
        style={{
          position: 'relative',
          filter: justRolled
            ? 'drop-shadow(0 0 14px rgba(255,215,0,0.8))'
            : rolling
            ? 'drop-shadow(0 0 6px rgba(232,93,4,0.5))'
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
          transition: 'filter 0.3s ease',
        }}
      >
        <DiceFace value={displayValue} size={76} rolling={rolling} />

        {/* Result pop-up above dice */}
        {justRolled && (
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontWeight: 900,
              color: '#E85D04',
              animation: 'popIn 0.35s ease-out forwards',
              whiteSpace: 'nowrap',
              textShadow: '0 2px 8px rgba(232,93,4,0.4)',
            }}
          >
            {diceResult}が出た！
          </div>
        )}
      </div>

      {/* Status label */}
      <p
        className="text-xs text-center"
        style={{ color: '#8b6914', fontFamily: 'var(--font-body)', minHeight: '1rem' }}
      >
        {phaseLabel()}
      </p>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={!canRoll}
        className="btn-primary w-full"
        style={{
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.08em',
          fontSize: '0.9rem',
          padding: '10px',
          animation: canRoll && !rolling ? 'none' : 'none',
        }}
      >
        {rolling ? '🎲 ころころ…' : canRoll ? '🎲 サイコロを振る！' : '⏳ 待機中…'}
      </button>

      {/* Destination hint */}
      {destName && (
        <div
          style={{
            width: '100%',
            background: 'rgba(255,215,0,0.07)',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '8px',
            padding: '5px 8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              color: 'rgba(255,215,0,0.7)',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.06em',
              marginBottom: '1px',
            }}
          >
            目的地まで
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#5a4a2a',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            🎯 {destName}
          </div>
        </div>
      )}

      {/* Current player indicator */}
      {currentPlayer && (
        <div
          style={{
            width: '100%',
            borderRadius: '8px',
            padding: '6px 10px',
            textAlign: 'center',
            fontSize: '12px',
            background: 'rgba(232,93,4,0.07)',
            border: '1px solid rgba(232,93,4,0.18)',
            color: '#C93E0E',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span style={{ fontWeight: 700 }}>{currentPlayer.name}</span>
          {currentPlayer.isBot ? ' 🤖' : ''} のターン
        </div>
      )}
    </div>
  )
}
