import useGameStore from '../store/gameStore'
import boardData from '../data/board.json'

function formatMoney(amount) {
  if (typeof amount !== 'number') return '¥0'
  return '¥' + amount.toLocaleString('ja-JP')
}

function getSquareName(squareId) {
  if (!squareId) return '—'
  const sq = boardData?.squares?.find((s) => s.id === squareId)
  return sq?.label || squareId
}

function getRankMedal(rank) {
  if (rank === 0) return '🥇'
  if (rank === 1) return '🥈'
  if (rank === 2) return '🥉'
  return `${rank + 1}位`
}

function RankBadge({ rank }) {
  const medal = getRankMedal(rank)
  const isFirst = rank === 0
  return (
    <span
      style={{
        fontSize: isFirst ? '16px' : '13px',
        flexShrink: 0,
        filter: isFirst ? 'drop-shadow(0 0 4px rgba(255,215,0,0.6))' : 'none',
        animation: isFirst ? 'rankPulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {medal}
    </span>
  )
}

export default function GameHUD() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const year = useGameStore((s) => s.year ?? s.round ?? 1)
  const maxYears = useGameStore((s) => s.maxYears ?? s.maxRounds ?? 12)
  const shopOwners = useGameStore((s) => s.shopOwners ?? {})
  const dotabataActive = useGameStore((s) => s.dotabataActive)
  const dotabataTargetId = useGameStore((s) => s.dotabataTargetId)

  // Sort players by money for ranking
  const rankedPlayers = [...players]
    .map((p, originalIdx) => ({ ...p, originalIdx }))
    .sort((a, b) => (b.money || 0) - (a.money || 0))

  // Map original index to rank
  const rankMap = {}
  rankedPlayers.forEach((p, rank) => {
    rankMap[p.id] = rank
  })

  // Count properties owned per player
  const ownedCountMap = {}
  Object.values(shopOwners).forEach((playerId) => {
    ownedCountMap[playerId] = (ownedCountMap[playerId] || 0) + 1
  })

  return (
    <div className="space-y-2">
      {/* Year counter — big and prominent */}
      <div
        className="rounded-xl px-3 py-2.5 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #0d1b4b)',
          border: '1.5px solid rgba(255,215,0,0.3)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '9px',
              color: 'rgba(255,215,0,0.6)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: '2px',
            }}
          >
            現在の年度
          </div>
          <div
            className="year-counter"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '20px',
              background: 'linear-gradient(135deg, #FFD700, #FF9500)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 4s linear infinite',
              lineHeight: 1,
            }}
          >
            第{year}年
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255,248,230,0.45)',
              fontFamily: 'var(--font-body)',
            }}
          >
            全{maxYears}年
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: '60px',
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min((year / maxYears) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #FFD700, #FF9500)',
                borderRadius: '999px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Player cards — shown in turn order, with rank */}
      {players.map((player, idx) => {
        const isActive = idx === currentPlayerIndex
        const color = player.color || '#E85D04'
        const rank = rankMap[player.id] ?? idx
        const squareName = getSquareName(player.position)
        const ownedCount = ownedCountMap[player.id] || 0
        const cardCount = player.cards?.length || 0
        const destCount = player.destinationsReached || 0
        const hasDotabata = player.id === dotabataTargetId && dotabataActive
        const isFirst = rank === 0

        return (
          <div
            key={player.id}
            className="rounded-xl transition-all duration-300"
            style={{
              background: isActive
                ? `linear-gradient(135deg, rgba(232,93,4,0.1), rgba(232,93,4,0.04))`
                : 'rgba(255,255,255,0.6)',
              border: isActive
                ? `2px solid ${color}`
                : isFirst
                ? '2px solid rgba(255,215,0,0.35)'
                : '2px solid rgba(139,105,20,0.15)',
              boxShadow: isActive
                ? `0 4px 16px rgba(232,93,4,0.2), 0 0 0 1px rgba(232,93,4,0.08)`
                : isFirst
                ? '0 2px 8px rgba(255,215,0,0.1)'
                : 'none',
              transform: isActive ? 'scale(1.01)' : 'scale(1)',
              overflow: 'hidden',
            }}
          >
            {/* Top stripe for active player */}
            {isActive && (
              <div
                style={{
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }}
              />
            )}

            <div style={{ padding: '10px 12px' }}>
              {/* Header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RankBadge rank={rank} />
                  {/* Color dot */}
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: color,
                      boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: isActive ? color : '#1a1a2e',
                    }}
                  >
                    {player.name}
                    {player.isBot && (
                      <span style={{ marginLeft: 4, fontSize: '10px', opacity: 0.6 }}>🤖</span>
                    )}
                  </span>
                </div>

                {/* Turn badge or Dotabata badge */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {hasDotabata && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        background: 'rgba(139,0,0,0.12)',
                        color: '#8B0000',
                        border: '1px solid rgba(139,0,0,0.3)',
                        fontWeight: 700,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      👺 ドタバタ
                    </span>
                  )}
                  {isActive && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        background: color,
                        color: 'white',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        animation: 'wiggle 1.5s ease-in-out infinite',
                      }}
                    >
                      ▶ターン
                    </span>
                  )}
                </div>
              </div>

              {/* Money — large display */}
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  fontSize: isActive ? '20px' : '17px',
                  color: isActive ? '#1a1a2e' : '#4a3818',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatMoney(player.money)}
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Properties */}
                {ownedCount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '10px',
                      color: '#C93E0E',
                      fontWeight: 700,
                      background: 'rgba(232,93,4,0.08)',
                      padding: '1px 5px',
                      borderRadius: '5px',
                    }}
                  >
                    🏠×{ownedCount}
                  </div>
                )}

                {/* Cards in hand */}
                {cardCount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '10px',
                      color: '#9333ea',
                      fontWeight: 700,
                      background: 'rgba(147,51,234,0.06)',
                      padding: '1px 5px',
                      borderRadius: '5px',
                    }}
                  >
                    🃏×{cardCount}
                  </div>
                )}

                {/* Destinations reached */}
                {destCount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1px',
                      fontSize: '10px',
                      color: '#2D9E6B',
                      fontWeight: 700,
                    }}
                  >
                    🎯{Array.from({ length: Math.min(destCount, 5) }).map((_, i) => (
                      <span key={i} style={{ fontSize: '9px' }}>✓</span>
                    ))}
                  </div>
                )}

                {/* Position */}
                <div
                  style={{
                    fontSize: '10px',
                    color: '#8b6914',
                    marginLeft: 'auto',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '80px',
                  }}
                >
                  📍{squareName.length > 6 ? squareName.slice(0, 6) + '…' : squareName}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Current player turn hint */}
      {players[currentPlayerIndex] && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '11px',
            padding: '6px 8px',
            borderRadius: '8px',
            background: 'rgba(232,93,4,0.06)',
            color: '#C93E0E',
            fontFamily: 'var(--font-body)',
            border: '1px solid rgba(232,93,4,0.15)',
          }}
        >
          → <span style={{ fontWeight: 700 }}>{players[currentPlayerIndex].name}</span> のターン
        </div>
      )}
    </div>
  )
}
