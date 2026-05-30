import { useMemo } from 'react'
import useGameStore from '../store/gameStore'
import shops from '../data/shops.json'

const CONFETTI_COLORS = [
  '#E85D04', '#FFD700', '#1a4fff', '#2D9E6B', '#9333ea', '#FF69B4', '#00CED1',
]

function ConfettiPiece({ color, left, delay, size, duration }) {
  return (
    <div
      className="confetti-piece pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-20px',
        background: color,
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

function formatMoney(amount) {
  if (typeof amount !== 'number') return '¥0'
  return '¥' + amount.toLocaleString('ja-JP')
}

export default function GameOverScreen({ onBackToTitle }) {
  const players = useGameStore((s) => s.players)
  const round = useGameStore((s) => s.round)
  const maxRounds = useGameStore((s) => s.maxRounds)
  const initGame = useGameStore((s) => s.initGame)

  // Sort players by money descending
  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (b.money || 0) - (a.money || 0))
  }, [players])

  const winner = rankedPlayers[0]

  // Confetti pieces
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 8 + 6,
      duration: Math.random() * 2 + 2.5,
    }))
  }, [])

  const handlePlayAgain = () => {
    // Reset the store by re-initializing with same player count and names
    const names = players.map((p) => p.name)
    const colors = players.map((p) => p.color)
    const botName = players.find((p) => p.isBot)?.name || null
    const humanCount = players.filter((p) => !p.isBot).length
    initGame(humanCount, names.filter((_, i) => !players[i].isBot), colors, botName)
    // Navigate back to title so user can re-setup
    onBackToTitle()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0d1b4b 50%, #1a1a2e 100%)',
      }}
    >
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.id} {...p} />
        ))}
      </div>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,215,0,0.05) 49px, rgba(255,215,0,0.05) 50px),
          repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,215,0,0.05) 49px, rgba(255,215,0,0.05) 50px)
        `,
      }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Winner announcement */}
        <div className="text-center mb-8 animate-pop-in">
          <div className="text-6xl mb-4">🏆</div>
          <div
            className="text-sm font-bold tracking-widest mb-2"
            style={{ color: 'rgba(255,215,0,0.8)', fontFamily: 'var(--font-heading)' }}
          >
            ─ ゲーム終了！ ─
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black mb-1"
            style={{
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #FFD700, #FF9500, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            {winner?.name} の優勝！
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,248,230,0.6)', fontFamily: 'var(--font-body)' }}>
            全{maxRounds}ラウンド終了
          </p>
        </div>

        {/* Final scores */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="text-sm font-bold tracking-widest mb-4 text-center"
            style={{ color: 'rgba(255,215,0,0.8)', fontFamily: 'var(--font-heading)' }}
          >
            ─ 最終スコア ─
          </div>

          <div className="space-y-3">
            {rankedPlayers.map((player, rank) => {
              const color = player.color || '#E85D04'
              const isWinner = rank === 0
              const medalEmoji = rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'

              return (
                <div
                  key={player.id}
                  className="rounded-xl p-3 flex items-center gap-3 transition-all duration-200"
                  style={{
                    background: isWinner
                      ? 'rgba(255,215,0,0.12)'
                      : 'rgba(255,255,255,0.05)',
                    border: isWinner
                      ? '1.5px solid rgba(255,215,0,0.4)'
                      : '1.5px solid rgba(255,255,255,0.08)',
                    animation: isWinner ? 'popIn 0.5s ease-out forwards' : 'none',
                  }}
                >
                  {/* Rank */}
                  <span className="text-2xl flex-shrink-0">{medalEmoji}</span>

                  {/* Player color dot */}
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-bold text-sm"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: isWinner ? '#FFD700' : 'rgba(255,248,230,0.9)',
                      }}
                    >
                      {player.name}
                      {player.isBot && <span className="ml-1 text-xs opacity-60">🤖</span>}
                    </div>
                    <div className="text-xs mt-0.5"
                      style={{ color: 'rgba(255,248,230,0.5)', fontFamily: 'var(--font-body)' }}>
                      🏪 {player.visitedShops?.length || 0}軒訪問
                    </div>
                  </div>

                  {/* Money */}
                  <div
                    className="text-right flex-shrink-0"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <div
                      className="font-black text-lg"
                      style={{ color: isWinner ? '#FFD700' : 'rgba(255,248,230,0.9)' }}
                    >
                      {formatMoney(player.money)}
                    </div>
                    {rank > 0 && rankedPlayers[0] && (
                      <div
                        className="text-xs"
                        style={{ color: '#DC2626', fontFamily: 'var(--font-body)' }}
                      >
                        -{formatMoney((rankedPlayers[0].money || 0) - (player.money || 0))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Visited shops per player */}
        {rankedPlayers.some((p) => (p.visitedShops?.length || 0) > 0) && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="text-sm font-bold tracking-widest mb-4 text-center"
              style={{ color: 'rgba(255,215,0,0.8)', fontFamily: 'var(--font-heading)' }}
            >
              ─ 訪問したお店 ─
            </div>

            {rankedPlayers.map((player) => {
              const color = player.color || '#E85D04'
              const visitedShopData = (player.visitedShops || [])
                .map((id) => (shops || []).find((s) => s.id === id))
                .filter(Boolean)

              if (visitedShopData.length === 0) return null

              return (
                <div key={player.id} className="mb-4 last:mb-0">
                  <div
                    className="flex items-center gap-2 mb-2 text-sm font-bold"
                    style={{ color: 'rgba(255,248,230,0.8)', fontFamily: 'var(--font-heading)' }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                    {player.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-5">
                    {visitedShopData.map((shop) => (
                      <span
                        key={shop.id}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,179,71,0.2)',
                          color: '#FFB347',
                          border: '1px solid rgba(255,179,71,0.35)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        🏪 {shop.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="btn-primary flex-1 py-4 text-base"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.08em' }}
          >
            🎲 もう一度あそぶ
          </button>
          <button
            onClick={onBackToTitle}
            className="btn-secondary py-4 px-5 text-sm"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'rgba(255,248,230,0.8)',
              borderColor: 'rgba(255,248,230,0.3)',
            }}
          >
            タイトルへ
          </button>
        </div>
      </div>
    </div>
  )
}
