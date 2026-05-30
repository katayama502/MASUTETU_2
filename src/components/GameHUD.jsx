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

export default function GameHUD() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const round = useGameStore((s) => s.round)
  const maxRounds = useGameStore((s) => s.maxRounds)

  return (
    <div className="space-y-2">
      {/* Round indicator */}
      <div
        className="rounded-xl px-3 py-2 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #0d1b4b)',
          border: '1px solid rgba(255,215,0,0.25)',
        }}
      >
        <span className="text-xs font-bold tracking-widest"
          style={{ color: 'rgba(255,215,0,0.8)', fontFamily: 'var(--font-heading)' }}>
          ラウンド
        </span>
        <span className="font-black text-sm"
          style={{ color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
          第{round}回 <span className="font-normal text-xs opacity-60">/ 全{maxRounds}回</span>
        </span>
      </div>

      {/* Player cards */}
      {players.map((player, idx) => {
        const isActive = idx === currentPlayerIndex
        const color = player.color || '#E85D04'
        const squareName = getSquareName(player.position)

        return (
          <div
            key={player.id}
            className="rounded-xl p-3 transition-all duration-300"
            style={{
              background: isActive
                ? `linear-gradient(135deg, rgba(232,93,4,0.08), rgba(232,93,4,0.04))`
                : 'rgba(255,255,255,0.6)',
              border: isActive
                ? `2px solid ${color}`
                : '2px solid rgba(139,105,20,0.15)',
              boxShadow: isActive
                ? `0 4px 16px rgba(232,93,4,0.2), 0 0 0 1px rgba(232,93,4,0.1)`
                : 'none',
              transform: isActive ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {/* Color dot */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    background: color,
                    boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                    animation: isActive ? 'pulseRing 1.5s ease-out infinite' : 'none',
                  }}
                />
                <span
                  className="font-bold text-sm"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: isActive ? color : '#1a1a2e',
                  }}
                >
                  {player.name}
                  {player.isBot && <span className="ml-1 text-xs opacity-60">🤖</span>}
                </span>
              </div>

              {/* Turn arrow */}
              {isActive && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: color,
                    color: 'white',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    animation: 'wiggle 1.5s ease-in-out infinite',
                  }}
                >
                  ▶ターン
                </span>
              )}
            </div>

            {/* Money */}
            <div
              className="text-lg font-black mb-1"
              style={{
                fontFamily: 'var(--font-heading)',
                color: isActive ? '#1a1a2e' : '#4a3818',
              }}
            >
              {formatMoney(player.money)}
            </div>

            {/* Position & stats */}
            <div className="flex items-center justify-between text-xs"
              style={{ color: '#8b6914', fontFamily: 'var(--font-body)' }}>
              <span className="truncate mr-2" style={{ maxWidth: '120px' }}>
                📍 {squareName}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span title="訪問済みお店数">
                  🏪 {player.visitedShops?.length || 0}軒
                </span>
                {player.items?.length > 0 && (
                  <span title="アイテム数">
                    🎁 {player.items.length}個
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Current player turn label */}
      {players[currentPlayerIndex] && (
        <div
          className="text-center text-xs py-1.5 rounded-lg"
          style={{
            background: 'rgba(232,93,4,0.06)',
            color: '#C93E0E',
            fontFamily: 'var(--font-body)',
            border: '1px solid rgba(232,93,4,0.15)',
          }}
        >
          → <span className="font-bold">{players[currentPlayerIndex].name}</span> のターン
        </div>
      )}
    </div>
  )
}
