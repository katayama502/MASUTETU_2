import { useMemo } from 'react'
import useGameStore from '../store/gameStore'

const CONFETTI_COLORS = [
  '#FFD700', '#E85D04', '#FF69B4', '#00CED1', '#2D9E6B', '#9333ea', '#FF6B6B',
]

function formatMoney(amount) {
  if (typeof amount !== 'number') return '¥0'
  return '¥' + amount.toLocaleString('ja-JP')
}

function ConfettiPiece({ color, left, delay, size, duration, shape }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: '-20px',
        width: size,
        height: size,
        background: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'star' ? '2px' : '2px',
        transform: shape === 'star' ? 'rotate(45deg)' : undefined,
        animationName: 'confettiFall',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationTimingFunction: 'ease-in',
        animationFillMode: 'forwards',
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    />
  )
}

export default function DestinationModal() {
  const activeDestinationReached = useGameStore((s) => s.activeDestinationReached)
  const dismissDestinationReached = useGameStore((s) => s.dismissDestinationReached)

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: Math.random() * 10 + 6,
        duration: Math.random() * 2 + 2,
        shape: ['circle', 'rect', 'star'][i % 3],
      })),
    []
  )

  if (!activeDestinationReached) return null

  const { shop, bonus, playerName } = activeDestinationReached
  const destName = shop?.name || shop?.label || '目的地'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(5, 8, 30, 0.88)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.25s ease-out forwards',
      }}
    >
      {/* Confetti overlay */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.id} {...p} />
        ))}
      </div>

      {/* Main card */}
      <div
        className="animate-dest-reached"
        style={{
          background: 'linear-gradient(160deg, #0d1b4b 0%, #1a1a2e 100%)',
          borderRadius: '24px',
          border: '3px solid rgba(255,215,0,0.7)',
          boxShadow: '0 0 60px rgba(255,215,0,0.3), 0 24px 64px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: '420px',
          overflow: 'hidden',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top glow band */}
        <div
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)',
            height: '3px',
          }}
        />

        {/* Content */}
        <div style={{ padding: '32px 28px 28px' }}>
          {/* Big target icon */}
          <div
            style={{
              fontSize: '56px',
              lineHeight: 1,
              marginBottom: '12px',
              filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))',
              animation: 'targetPulse 1.5s ease-in-out infinite',
            }}
          >
            🎯
          </div>

          {/* Header */}
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'rgba(255,215,0,0.7)',
              fontWeight: 700,
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            ─ 目的地到達！ ─
          </div>

          <h2
            style={{
              fontSize: '28px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FFD700, #FF9500, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 2s linear infinite',
              marginBottom: '8px',
              lineHeight: 1.2,
            }}
          >
            {playerName}
          </h2>

          <div
            style={{
              fontSize: '16px',
              color: 'rgba(255,248,230,0.9)',
              fontWeight: 700,
              marginBottom: '24px',
            }}
          >
            「{destName}」に到達！
          </div>

          {/* Big bonus display */}
          {bonus > 0 && (
            <div
              style={{
                background: 'rgba(255,215,0,0.08)',
                border: '2px solid rgba(255,215,0,0.4)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,215,0,0.65)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  marginBottom: '6px',
                }}
              >
                到達ボーナス獲得！
              </div>
              <div
                className="animate-money-big"
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FFD700, #FF9500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                +{formatMoney(bonus)}
              </div>
            </div>
          )}

          {/* Stars decoration */}
          <div style={{ marginBottom: '24px', fontSize: '20px', letterSpacing: '8px' }}>
            ⭐⭐⭐
          </div>

          {/* Dismiss button */}
          <button
            onClick={dismissDestinationReached}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #FFD700, #FF9500)',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,215,0,0.4)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,215,0,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,215,0,0.4)'
            }}
          >
            すごい！続ける
          </button>

          <div
            style={{
              marginTop: '10px',
              fontSize: '11px',
              color: 'rgba(255,248,230,0.4)',
              fontFamily: 'var(--font-body)',
            }}
          >
            タップして続ける
          </div>
        </div>

        {/* Bottom glow band */}
        <div
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)',
            height: '3px',
          }}
        />
      </div>
    </div>
  )
}
