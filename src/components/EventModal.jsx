import { useState } from 'react'
import useGameStore from '../store/gameStore'
import MoneyPopup from './MoneyPopup'

const EVENT_TYPE_CONFIG = {
  money_gain: {
    icon: '💰',
    color: '#2D9E6B',
    bgColor: 'rgba(45,158,107,0.1)',
    borderColor: 'rgba(45,158,107,0.3)',
    label: 'お金獲得',
  },
  money_loss: {
    icon: '💸',
    color: '#DC2626',
    bgColor: 'rgba(220,38,38,0.1)',
    borderColor: 'rgba(220,38,38,0.3)',
    label: 'お金減少',
  },
  move: {
    icon: '🚃',
    color: '#1a4fff',
    bgColor: 'rgba(26,79,255,0.1)',
    borderColor: 'rgba(26,79,255,0.3)',
    label: '移動',
  },
  item: {
    icon: '🎁',
    color: '#9333ea',
    bgColor: 'rgba(147,51,234,0.1)',
    borderColor: 'rgba(147,51,234,0.3)',
    label: 'アイテム取得',
  },
  normal: {
    icon: '🎉',
    color: '#E85D04',
    bgColor: 'rgba(232,93,4,0.08)',
    borderColor: 'rgba(232,93,4,0.25)',
    label: 'イベント',
  },
}

export default function EventModal() {
  const activeEvent = useGameStore((s) => s.activeEvent)
  const dismissEvent = useGameStore((s) => s.dismissEvent)
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)

  const [showPopup, setShowPopup] = useState(false)
  const [applied, setApplied] = useState(false)

  if (!activeEvent) return null

  const eventType = activeEvent.type || 'normal'
  const cfg = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.normal
  const amount = activeEvent.amount || 0
  const isGain = amount > 0

  const handleContinue = () => {
    if (applied) return
    setApplied(true)

    // Show money popup if there's an amount
    if (amount !== 0) {
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 2000)
    }

    setTimeout(() => dismissEvent(), 500)
  }

  return (
    <div className="modal-backdrop flex items-end sm:items-center justify-center p-4">
      <div
        className="modal-content w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header banner */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${cfg.bgColor.replace('0.1', '0.5')}, ${cfg.bgColor})`,
            borderBottom: `2px solid ${cfg.borderColor}`,
          }}
        >
          <span className="text-4xl">{cfg.icon}</span>
          <div>
            <div
              className="text-xs font-bold tracking-widest mb-0.5"
              style={{ color: cfg.color, fontFamily: 'var(--font-heading)' }}
            >
              ─ {cfg.label} ─
            </div>
            <div
              className="text-lg font-black"
              style={{ fontFamily: 'var(--font-heading)', color: '#1a1a2e' }}
            >
              {activeEvent.title || 'イベント発生！'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Description */}
          {activeEvent.description && (
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}
            >
              {activeEvent.description}
            </p>
          )}

          {/* Effect display */}
          {amount !== 0 && (
            <div
              className="rounded-xl px-4 py-3 mb-4 relative overflow-hidden"
              style={{
                background: cfg.bgColor,
                border: `1.5px solid ${cfg.borderColor}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-bold"
                  style={{ color: cfg.color, fontFamily: 'var(--font-body)' }}
                >
                  {players[currentPlayerIndex]?.name}
                </span>
                <span
                  className="text-2xl font-black"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: isGain ? '#2D9E6B' : '#DC2626',
                    animation: 'popIn 0.4s ease-out forwards',
                  }}
                >
                  {isGain ? '+' : ''}¥{Math.abs(amount).toLocaleString('ja-JP')}
                </span>
              </div>

              {/* Money popup */}
              {showPopup && (
                <div className="absolute top-2 right-2">
                  <MoneyPopup amount={amount} />
                </div>
              )}
            </div>
          )}

          {/* Move effect */}
          {activeEvent.moveSquares && (
            <div
              className="rounded-xl px-4 py-3 mb-4"
              style={{
                background: 'rgba(26,79,255,0.08)',
                border: '1.5px solid rgba(26,79,255,0.25)',
              }}
            >
              <div className="flex items-center gap-2 text-sm">
                <span>🚃</span>
                <span style={{ color: '#1a4fff', fontFamily: 'var(--font-body)', fontWeight: 'bold' }}>
                  {activeEvent.moveSquares > 0
                    ? `${activeEvent.moveSquares}マス前に進む`
                    : `${Math.abs(activeEvent.moveSquares)}マス後ろに戻る`}
                </span>
              </div>
            </div>
          )}

          {/* Target player note */}
          {activeEvent.targetAll && (
            <div
              className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2 text-sm"
              style={{
                background: 'rgba(232,93,4,0.06)',
                border: '1px solid rgba(232,93,4,0.2)',
                color: '#E85D04',
              }}
            >
              <span>⚡</span>
              <span style={{ fontFamily: 'var(--font-body)' }}>
                全プレイヤーに効果があります
              </span>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={applied}
            className="btn-primary w-full py-3"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              letterSpacing: '0.05em',
            }}
          >
            {applied ? '処理中…' : 'つづける'}
          </button>
        </div>
      </div>
    </div>
  )
}
