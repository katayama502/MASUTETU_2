import { useState, useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'

// Pip layouts for each face value
const PIP_LAYOUTS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
}

function DiceFace({ value, size = 80, rolling = false }) {
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1]
  const pipSize = Math.round(size * 0.15)
  const cell = Math.round(size * 0.26)
  const pad  = Math.round(size * 0.14)

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
        background: 'white',
        borderRadius: 14,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.15)',
        border: '3px solid #e0d8cc',
      }}
    >
      {/* Render cells 3x3 = 9 positions */}
      {Array.from({ length: 9 }).map((_, cellIdx) => {
        const row = Math.floor(cellIdx / 3)
        const col = cellIdx % 3
        const hasPip = pips.some(([r, c]) => r === row && c === col)
        return (
          <div
            key={cellIdx}
            className="flex items-center justify-center"
          >
            {hasPip && (
              <div
                className="dice-pip"
                style={{
                  width: pipSize,
                  height: pipSize,
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

  // Animate when dice result changes
  useEffect(() => {
    if (diceResult !== null && diceResult !== prevResult.current) {
      prevResult.current = diceResult
      setRolling(true)
      setJustRolled(false)

      // Flicker effect
      let count = 0
      rollInterval.current = setInterval(() => {
        setDisplayValue(Math.ceil(Math.random() * 6))
        count++
        if (count >= 12) {
          clearInterval(rollInterval.current)
          setDisplayValue(diceResult)
          setRolling(false)
          setJustRolled(true)
          setTimeout(() => setJustRolled(false), 2000)
        }
      }, 65)
    }
    return () => clearInterval(rollInterval.current)
  }, [diceResult])

  const handleRoll = () => {
    if (!canRoll) return
    setRolling(true)
    setJustRolled(false)
    // Visual pre-roll
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
      return 'さいころを振ってください'
    }
    if (phase === 'moving') return '移動中…'
    if (phase === 'landing') return 'マスに着地！'
    if (phase === 'event') return 'イベント発生！'
    if (phase === 'gameover') return 'ゲーム終了'
    return '順番を待っています'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs font-bold tracking-widest text-center"
        style={{ color: '#8b6914', fontFamily: 'var(--font-heading)' }}>
        ─ さいころ ─
      </div>

      {/* Dice display */}
      <div
        className="relative"
        style={{
          filter: justRolled ? 'drop-shadow(0 0 12px rgba(255,215,0,0.7))' : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        <DiceFace value={displayValue} size={72} rolling={rolling} />
        {justRolled && (
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg font-black"
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#E85D04',
              animation: 'popIn 0.35s ease-out forwards',
              whiteSpace: 'nowrap',
            }}
          >
            {diceResult}が出た！
          </div>
        )}
      </div>

      {/* Status label */}
      <p className="text-xs text-center"
        style={{ color: '#8b6914', fontFamily: 'var(--font-body)', minHeight: '1rem' }}>
        {phaseLabel()}
      </p>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={!canRoll}
        className="btn-primary w-full text-sm py-2.5"
        style={{
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.08em',
          fontSize: '0.9rem',
        }}
      >
        {rolling ? '🎲 ころころ…' : 'サイコロを振る！'}
      </button>

      {/* Current player indicator */}
      {currentPlayer && (
        <div
          className="w-full rounded-lg px-3 py-2 text-center text-xs"
          style={{
            background: 'rgba(232,93,4,0.08)',
            border: '1px solid rgba(232,93,4,0.2)',
            color: '#C93E0E',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span className="font-bold">{currentPlayer.name}</span>
          {currentPlayer.isBot ? ' 🤖' : ''} のターン
        </div>
      )}
    </div>
  )
}
