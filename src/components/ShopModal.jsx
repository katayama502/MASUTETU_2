import { useState } from 'react'
import useGameStore from '../store/gameStore'
import MoneyPopup from './MoneyPopup'

const CATEGORY_COLORS = {
  '飲食': '#FF8C42',
  'ランチ': '#FF8C42',
  'カフェ': '#C77DFF',
  '観光': '#4CC9F0',
  '体験': '#4CC9F0',
  '物産': '#2EC4B6',
  'お土産': '#2EC4B6',
  '宿泊': '#FF6B9D',
  'ホテル': '#FF6B9D',
  'ショッピング': '#44BBA4',
}

const VISIT_BONUS = 500

export default function ShopModal() {
  const activeShop = useGameStore((s) => s.activeShop)
  const dismissShop = useGameStore((s) => s.dismissShop)
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)

  const [visited, setVisited] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  if (!activeShop) return null

  const currentPlayer = players[currentPlayerIndex]
  const alreadyVisited = currentPlayer?.visitedShops?.includes(activeShop.id)

  const categoryColor = CATEGORY_COLORS[activeShop.category] || '#FFB347'

  const handleVisit = () => {
    if (visited || alreadyVisited) return
    setVisited(true)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 2000)
    // The store's dismissShop should handle the visit bonus
    // We pass visited=true flag
    setTimeout(() => dismissShop(true), 400)
  }

  const handleClose = () => {
    dismissShop(false)
  }

  return (
    <div className="modal-backdrop flex items-end sm:items-center justify-center p-4">
      <div
        className="modal-content w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Photo area */}
        <div
          className="relative h-40 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${categoryColor}33, ${categoryColor}66)` }}
        >
          {activeShop.photo ? (
            <img
              src={activeShop.photo}
              alt={activeShop.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2">🏪</div>
              <div className="text-sm opacity-60" style={{ color: '#4a3818' }}>
                写真なし
              </div>
            </div>
          )}

          {/* Category badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ background: categoryColor, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            {activeShop.category || 'お店'}
          </div>

          {/* Money popup */}
          {showPopup && (
            <div className="absolute top-4 right-4">
              <MoneyPopup amount={VISIT_BONUS} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Shop name */}
          <h2
            className="text-2xl font-black mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: '#1a1a2e' }}
          >
            {activeShop.name}
          </h2>

          {/* Description */}
          {activeShop.description && (
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}
            >
              {activeShop.description}
            </p>
          )}

          {/* Info rows */}
          <div
            className="space-y-2 mb-4 p-3 rounded-xl"
            style={{ background: '#FFF8E7', border: '1px solid rgba(139,105,20,0.2)' }}
          >
            {activeShop.address && (
              <div className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0">📍</span>
                <span style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}>
                  {activeShop.address}
                </span>
              </div>
            )}
            {activeShop.hours && (
              <div className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0">🕐</span>
                <span style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}>
                  {activeShop.hours}
                </span>
              </div>
            )}
            {activeShop.url && (
              <div className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0">🌐</span>
                <a
                  href={activeShop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                  style={{ color: '#1a4fff', fontFamily: 'var(--font-body)' }}
                >
                  {activeShop.url}
                </a>
              </div>
            )}
          </div>

          {/* Visit bonus notice */}
          {!alreadyVisited && !visited && (
            <div
              className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2 text-sm"
              style={{
                background: 'rgba(45,158,107,0.1)',
                border: '1px solid rgba(45,158,107,0.3)',
                color: '#2D9E6B',
              }}
            >
              <span>💰</span>
              <span style={{ fontFamily: 'var(--font-body)' }}>
                訪問ボーナス <strong>+¥{VISIT_BONUS.toLocaleString('ja-JP')}</strong> がもらえます
              </span>
            </div>
          )}

          {alreadyVisited && (
            <div
              className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2 text-sm"
              style={{
                background: 'rgba(139,105,20,0.08)',
                border: '1px solid rgba(139,105,20,0.2)',
                color: '#8b6914',
              }}
            >
              <span>✅</span>
              <span style={{ fontFamily: 'var(--font-body)' }}>
                すでに訪問済みのお店です
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!alreadyVisited && !visited ? (
              <button
                onClick={handleVisit}
                className="btn-primary flex-1 py-3"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}
              >
                🏪 お店を訪問！
              </button>
            ) : (
              <div
                className="flex-1 py-3 rounded-full text-center text-sm font-bold"
                style={{
                  background: 'rgba(45,158,107,0.12)',
                  color: '#2D9E6B',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                ✅ 訪問完了
              </div>
            )}
            <button
              onClick={handleClose}
              className="btn-secondary py-3 px-5"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}
            >
              とじる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
