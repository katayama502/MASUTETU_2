import useGameStore from '../store/gameStore'

function formatMoney(amount) {
  if (typeof amount !== 'number') return '¥0'
  return '¥' + amount.toLocaleString('ja-JP')
}

export default function YearEndModal() {
  const activeYearEnd = useGameStore((s) => s.activeYearEnd)
  const dismissYearEnd = useGameStore((s) => s.dismissYearEnd)
  const players = useGameStore((s) => s.players)
  const dotabataActive = useGameStore((s) => s.dotabataActive)
  const dotabataTargetId = useGameStore((s) => s.dotabataTargetId)

  if (!activeYearEnd) return null

  const { year, incomes } = activeYearEnd

  // Build income list with player colors
  const incomeEntries = (incomes || []).map((entry) => {
    const player = players.find((p) => p.id === entry.playerId)
    return {
      ...entry,
      color: player?.color || '#8b6914',
      isBot: player?.isBot || false,
      hasDotabata: player?.id === dotabataTargetId && dotabataActive,
    }
  })

  const totalIncome = incomeEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
  const maxIncome = Math.max(...incomeEntries.map((e) => e.amount || 0), 1)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(10, 15, 40, 0.82)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.25s ease-out forwards',
      }}
    >
      <div
        className="modal-content"
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          fontFamily: 'var(--font-body)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0d1b4b)',
            padding: '18px 20px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '0.15em',
              color: 'rgba(255,215,0,0.7)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              marginBottom: '4px',
            }}
          >
            ─ 年度終了 ─
          </div>
          <div
            className="year-counter"
            style={{
              fontSize: '30px',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #FFD700, #FF9500, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
              lineHeight: 1.2,
            }}
          >
            第{year}年 終了！
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255,248,230,0.55)',
              marginTop: '4px',
              fontFamily: 'var(--font-body)',
            }}
          >
            各プレイヤーの年間収入を受け取りました
          </div>
        </div>

        {/* Income list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
          }}
        >
          {incomeEntries.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#8b6914',
                padding: '24px',
                fontSize: '13px',
              }}
            >
              今年度は収入がありませんでした
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {incomeEntries.map((entry) => {
                const barWidth =
                  entry.amount > 0 ? Math.round((entry.amount / maxIncome) * 100) : 0
                const isTop = entry.amount === maxIncome && entry.amount > 0

                return (
                  <div
                    key={entry.playerId}
                    style={{
                      borderRadius: '12px',
                      border: isTop
                        ? '2px solid rgba(45,158,107,0.4)'
                        : '2px solid rgba(139,105,20,0.12)',
                      background: isTop
                        ? 'linear-gradient(135deg, rgba(45,158,107,0.06), rgba(45,158,107,0.02))'
                        : entry.amount === 0
                        ? 'rgba(240,240,240,0.5)'
                        : 'rgba(255,248,230,0.7)',
                      padding: '10px 14px',
                      opacity: entry.amount === 0 ? 0.55 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: barWidth > 0 ? '6px' : '0',
                      }}
                    >
                      {/* Color dot */}
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: entry.color,
                          boxShadow: isTop ? `0 0 6px ${entry.color}` : 'none',
                          flexShrink: 0,
                        }}
                      />

                      {/* Name */}
                      <div
                        style={{
                          flex: 1,
                          fontWeight: 700,
                          fontSize: '13px',
                          color: entry.amount === 0 ? '#999' : '#1a1a2e',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {entry.playerName}
                        {entry.isBot && (
                          <span style={{ marginLeft: 4, fontSize: '11px', opacity: 0.6 }}>🤖</span>
                        )}
                        {entry.hasDotabata && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: '11px',
                              background: 'rgba(139,0,0,0.1)',
                              border: '1px solid rgba(139,0,0,0.3)',
                              borderRadius: '4px',
                              padding: '1px 4px',
                              color: '#8B0000',
                              fontWeight: 700,
                            }}
                          >
                            👺 ドタバタ
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 900,
                          fontFamily: 'var(--font-heading)',
                          color:
                            entry.amount > 0
                              ? isTop
                                ? '#2D9E6B'
                                : '#1a1a2e'
                              : '#999',
                        }}
                      >
                        {entry.amount > 0 ? '+' : ''}{formatMoney(entry.amount)}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {barWidth > 0 && (
                      <div
                        style={{
                          height: '4px',
                          background: 'rgba(0,0,0,0.08)',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${barWidth}%`,
                            background: isTop
                              ? 'linear-gradient(90deg, #2D9E6B, #4ade80)'
                              : `linear-gradient(90deg, ${entry.color}, ${entry.color}88)`,
                            borderRadius: '999px',
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer summary */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(139,105,20,0.15)',
            padding: '12px 16px',
            background: 'rgba(255,248,230,0.5)',
          }}
        >
          {/* Total */}
          {totalIncome > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                fontSize: '13px',
                color: '#5a4a2a',
              }}
            >
              <span style={{ fontWeight: 700 }}>年間収入総計</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  color: '#2D9E6B',
                  fontSize: '15px',
                }}
              >
                +{formatMoney(totalIncome)}
              </span>
            </div>
          )}

          {/* Dotabata note */}
          {dotabataActive && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                padding: '6px 10px',
                background: 'rgba(139,0,0,0.06)',
                border: '1px solid rgba(139,0,0,0.2)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#8B0000',
                fontWeight: 700,
              }}
            >
              <span>👺</span>
              ドタバタくんが移動します！
            </div>
          )}

          <button
            onClick={dismissYearEnd}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '15px',
              letterSpacing: '0.08em',
              borderRadius: '12px',
            }}
          >
            つぎへ →
          </button>
        </div>
      </div>
    </div>
  )
}
