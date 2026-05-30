import { useState } from 'react'
import useGameStore from '../store/gameStore'

const ITEM_ICONS = {
  dice_boost:   '🎲',
  money_bonus:  '💰',
  move_forward: '🚀',
  shield:       '🛡️',
  shop_bonus:   '🏪',
  default:      '🎁',
}

export default function ItemCard({ item, isCurrentPlayer = false }) {
  const useItem = useGameStore((s) => s.useItem)
  const phase = useGameStore((s) => s.phase)
  const [showTooltip, setShowTooltip] = useState(false)
  const [used, setUsed] = useState(false)

  if (!item) return null

  const icon = ITEM_ICONS[item.type] || ITEM_ICONS.default
  const canUse = isCurrentPlayer && phase === 'rolling' && !used

  const handleUse = () => {
    if (!canUse) return
    setUsed(true)
    useItem(item.id)
  }

  return (
    <div
      className="relative rounded-xl p-3 transition-all duration-200"
      style={{
        background: used
          ? 'rgba(139,105,20,0.08)'
          : 'linear-gradient(135deg, rgba(221,160,221,0.15), rgba(147,51,234,0.08))',
        border: used
          ? '1.5px solid rgba(139,105,20,0.2)'
          : '1.5px solid rgba(147,51,234,0.3)',
        opacity: used ? 0.6 : 1,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Item header */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-bold truncate"
            style={{ fontFamily: 'var(--font-heading)', color: used ? '#8b6914' : '#1a1a2e' }}
          >
            {item.name || 'アイテム'}
          </div>
        </div>
        {used && (
          <span className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(139,105,20,0.15)', color: '#8b6914', fontFamily: 'var(--font-body)' }}>
            使用済
          </span>
        )}
      </div>

      {/* Short description */}
      <p className="text-xs mb-2 line-clamp-2"
        style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}>
        {item.description || 'ゲームで使えるアイテム'}
      </p>

      {/* Use button */}
      {canUse && (
        <button
          onClick={handleUse}
          className="w-full py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            color: 'white',
            border: 'none',
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          つかう
        </button>
      )}

      {!canUse && !used && isCurrentPlayer && (
        <div className="text-xs text-center"
          style={{ color: '#8b6914', fontFamily: 'var(--font-body)', opacity: 0.7 }}>
          さいころを振るときにつかえます
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && item.effect && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 z-10 rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(26,26,46,0.92)',
            color: 'white',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            animation: 'popIn 0.2s ease-out forwards',
          }}
        >
          <div className="font-bold mb-1" style={{ color: '#DDA0DD' }}>効果:</div>
          <div>{item.effect}</div>
          {/* Arrow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
            style={{
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(26,26,46,0.92)',
            }}
          />
        </div>
      )}
    </div>
  )
}
