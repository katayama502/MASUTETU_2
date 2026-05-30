import { useMemo } from 'react'
import useGameStore from '../store/gameStore'
import boardData from '../data/board.json'

function formatMoney(amount) {
  if (typeof amount !== 'number') return '¥0'
  return '¥' + amount.toLocaleString('ja-JP')
}

export default function DestinationBanner() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)

  const currentPlayer = players[currentPlayerIndex]

  const destSquare = useMemo(() => {
    if (!currentPlayer?.destination) return null
    return boardData?.squares?.find((s) => s.id === currentPlayer.destination) || null
  }, [currentPlayer?.destination])

  if (!currentPlayer || !destSquare) return null

  const destName = destSquare.label || destSquare.id
  const bonus = currentPlayer.destinationBonus || 0
  const color = currentPlayer.color || '#E85D04'

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #0d1b4b 0%, #1a1a2e 60%, #0d1b4b 100%)',
        border: '2px solid rgba(255,215,0,0.45)',
        borderRadius: '10px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
        transition: 'all 0.4s ease',
        boxShadow: '0 2px 12px rgba(255,215,0,0.15)',
      }}
    >
      {/* Pulsing target icon */}
      <span
        className="target-pulse"
        style={{ fontSize: '18px', flexShrink: 0 }}
      >
        🎯
      </span>

      {/* Player color dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
        }}
      />

      {/* Destination info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(255,215,0,0.65)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          現在の目的地
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 900,
            color: 'white',
            fontFamily: 'var(--font-heading)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}
        >
          {destName}
        </div>
      </div>

      {/* Bonus amount */}
      {bonus > 0 && (
        <div
          style={{
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255,215,0,0.65)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            到達ボーナス
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #FFD700, #FF9500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ✨ {formatMoney(bonus)}
          </div>
        </div>
      )}

      {/* Destinations reached counter */}
      {(currentPlayer.destinationsReached || 0) > 0 && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '2px',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: currentPlayer.destinationsReached }).map((_, i) => (
            <span key={i} style={{ fontSize: '10px' }}>✓</span>
          ))}
        </div>
      )}
    </div>
  )
}
