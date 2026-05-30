import { useState } from 'react'
import useGameStore from '../store/gameStore'

const COLORS = [
  { id: 'orange', label: 'オレンジ', hex: '#E85D04' },
  { id: 'blue',   label: 'ブルー',   hex: '#1a4fff' },
  { id: 'green',  label: 'グリーン', hex: '#2D9E6B' },
  { id: 'purple', label: 'むらさき', hex: '#9333ea' },
]

const DEFAULT_NAMES = ['プレイヤー1', 'プレイヤー2']
const BOT_NAME = 'ますてつBot'

export default function SetupScreen({ onStart, onBack }) {
  const initGame = useGameStore((s) => s.initGame)

  const [playerCount, setPlayerCount] = useState(1)
  const [names, setNames] = useState(['', ''])
  const [colors, setColors] = useState(['orange', 'blue'])

  const handleNameChange = (i, val) => {
    const next = [...names]
    next[i] = val
    setNames(next)
  }

  const handleColorChange = (playerIdx, colorId) => {
    const next = [...colors]
    // Prevent same color for both players
    if (playerCount === 2 && next[1 - playerIdx] === colorId) return
    next[playerIdx] = colorId
    setColors(next)
  }

  const handleStart = () => {
    const resolvedNames = []
    for (let i = 0; i < playerCount; i++) {
      resolvedNames.push(names[i].trim() || DEFAULT_NAMES[i])
    }
    // Convert color IDs to hex values for the store
    const hexColors = colors.map((id) => COLORS.find((c) => c.id === id)?.hex || '#E85D04')
    const botName = playerCount === 1 ? BOT_NAME : null
    initGame(playerCount, resolvedNames, hexColors, botName)
    onStart()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0d1b4b 40%, #16213e 100%)',
      }}
    >
      {/* Japanese grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,215,0,0.05) 49px, rgba(255,215,0,0.05) 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,215,0,0.05) 49px, rgba(255,215,0,0.05) 50px)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-6 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: 'rgba(255,248,230,0.8)', fontFamily: 'var(--font-body)' }}
        >
          ← タイトルにもどる
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#FFD700',
              textShadow: '0 2px 12px rgba(255,215,0,0.3)',
            }}
          >
            プレイヤー設定
          </h1>
          <p className="text-sm opacity-60" style={{ color: 'rgba(255,248,230,0.7)' }}>
            ゲームの準備をしよう
          </p>
        </div>

        {/* Setup card */}
        <div
          className="rounded-2xl p-6 sm:p-8 space-y-8"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >

          {/* Player count */}
          <div>
            <label className="block text-sm font-bold mb-3 tracking-widest"
              style={{ color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
              プレイヤー人数
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { count: 1, label: '1人プレイ', sub: 'vsボット' },
                { count: 2, label: '2人プレイ', sub: 'ふたりで対戦' },
              ].map(({ count, label, sub }) => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className="py-3 px-4 rounded-xl font-bold text-center transition-all duration-200"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    background: playerCount === count
                      ? 'linear-gradient(135deg, #E85D04, #C93E0E)'
                      : 'rgba(255,255,255,0.08)',
                    color: playerCount === count ? 'white' : 'rgba(255,248,230,0.7)',
                    border: playerCount === count
                      ? '2px solid #E85D04'
                      : '2px solid rgba(255,255,255,0.12)',
                    boxShadow: playerCount === count
                      ? '0 4px 16px rgba(232,93,4,0.4)'
                      : 'none',
                    transform: playerCount === count ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="text-base">{label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Player name inputs */}
          <div className="space-y-4">
            <label className="block text-sm font-bold tracking-widest"
              style={{ color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
              プレイヤー名
            </label>

            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: COLORS.find(c => c.id === colors[i])?.hex || '#E85D04' }}
                  >
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={names[i]}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={DEFAULT_NAMES[i]}
                    maxLength={10}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '2px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,248,230,0.95)',
                      fontFamily: 'var(--font-body)',
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '2px solid rgba(232,93,4,0.7)'
                      e.target.style.background = 'rgba(255,255,255,0.14)'
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '2px solid rgba(255,255,255,0.15)'
                      e.target.style.background = 'rgba(255,255,255,0.1)'
                    }}
                  />
                </div>

                {/* Color picker for this player */}
                <div className="flex items-center gap-2 ml-11">
                  <span className="text-xs opacity-60 mr-1"
                    style={{ color: 'rgba(255,248,230,0.6)', fontFamily: 'var(--font-body)' }}>
                    色:
                  </span>
                  {COLORS.map((c) => {
                    const otherColor = playerCount === 2 ? colors[1 - i] : null
                    const isDisabled = c.id === otherColor
                    const isSelected = colors[i] === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => !isDisabled && handleColorChange(i, c.id)}
                        title={c.label}
                        disabled={isDisabled}
                        className="w-7 h-7 rounded-full transition-all duration-200"
                        style={{
                          background: c.hex,
                          opacity: isDisabled ? 0.25 : 1,
                          transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                          boxShadow: isSelected
                            ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                            : 'none',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Bot indicator */}
            {playerCount === 1 && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: COLORS.find(c => c.id === colors[1])?.hex || '#1a4fff' }}
                >
                  🤖
                </div>
                <div
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,248,230,0.5)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {BOT_NAME}（ボット）
                </div>
              </div>
            )}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="btn-primary w-full text-lg py-4"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}
          >
            🚃 ゲームスタート！
          </button>
        </div>
      </div>
    </div>
  )
}
