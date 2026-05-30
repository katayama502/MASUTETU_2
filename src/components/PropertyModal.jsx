import useGameStore from '../store/gameStore'

function formatMoney(amount) {
  if (typeof amount !== 'number') return '¥0'
  return '¥' + amount.toLocaleString('ja-JP')
}

const CATEGORY_ICONS = {
  food: '🍽️',
  souvenir: '🎁',
  nature: '🌿',
  culture: '🎭',
  sport: '⚽',
  accommodation: '🏨',
  default: '🏪',
}

export default function PropertyModal() {
  const activeBuyProperty = useGameStore((s) => s.activeBuyProperty)
  const buyProperty = useGameStore((s) => s.buyProperty)
  const skipBuyProperty = useGameStore((s) => s.skipBuyProperty)
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)

  if (!activeBuyProperty) return null

  const shop = activeBuyProperty.shop
  const currentPlayer = players[currentPlayerIndex]
  const cost = shop.cost || 0
  const income = shop.income || 0
  const rent = shop.rent || 0
  const canAfford = (currentPlayer?.money || 0) >= cost
  const afterPurchase = (currentPlayer?.money || 0) - cost
  const categoryIcon = CATEGORY_ICONS[shop.category] || CATEGORY_ICONS.default
  const color = currentPlayer?.color || '#E85D04'

  return (
    <div
      className="modal-backdrop"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 60,
      }}
    >
      <div
        className="modal-content"
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0d1b4b)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '22px' }}>🏠</span>
          <div>
            <div
              style={{
                color: '#FFD700',
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: '15px',
                letterSpacing: '0.05em',
              }}
            >
              物件購入チャンス！
            </div>
            <div style={{ color: 'rgba(255,248,230,0.6)', fontSize: '11px', marginTop: 1 }}>
              このお店を購入しますか？
            </div>
          </div>
        </div>

        {/* Shop info section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: '0',
            borderBottom: '1px solid rgba(139,105,20,0.15)',
          }}
        >
          {/* Left: icon */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFF8E7, #FDF3DC)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 8px',
              borderRight: '1px solid rgba(139,105,20,0.12)',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '32px' }}>{categoryIcon}</span>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#8b6914',
                fontFamily: 'var(--font-heading)',
                textAlign: 'center',
                letterSpacing: '0.04em',
              }}
            >
              {shop.category || 'お店'}
            </div>
          </div>

          {/* Right: details */}
          <div style={{ padding: '14px 16px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 900,
                color: '#1a1a2e',
                fontFamily: 'var(--font-heading)',
                marginBottom: '6px',
              }}
            >
              {shop.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#5a4a2a',
                lineHeight: 1.5,
                marginBottom: '8px',
              }}
            >
              {shop.description
                ? shop.description.slice(0, 60) + (shop.description.length > 60 ? '…' : '')
                : ''}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {income > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(45,158,107,0.1)',
                    border: '1px solid rgba(45,158,107,0.3)',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#2D9E6B',
                    fontWeight: 700,
                  }}
                >
                  📈 年収入 {formatMoney(income)}
                </div>
              )}
              {rent > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(232,93,4,0.08)',
                    border: '1px solid rgba(232,93,4,0.25)',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#C93E0E',
                    fontWeight: 700,
                  }}
                >
                  🏠 家賃 {formatMoney(rent)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div
          style={{
            padding: '14px 20px',
            background: '#FAFAF8',
            borderBottom: '1px solid rgba(139,105,20,0.12)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b6914', fontWeight: 700, marginBottom: 3 }}>
                購入価格
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: '#1a1a2e',
                }}
              >
                {formatMoney(cost)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b6914', fontWeight: 700, marginBottom: 3 }}>
                現在の所持金
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: '#1a1a2e',
                }}
              >
                {formatMoney(currentPlayer?.money || 0)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#8b6914', fontWeight: 700, marginBottom: 3 }}>
                購入後の残額
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: canAfford ? '#2D9E6B' : '#DC2626',
                }}
              >
                {canAfford ? formatMoney(afterPurchase) : '資金不足'}
              </div>
            </div>
          </div>

          {/* Player indicator */}
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#5a4a2a',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 5px ${color}`,
              }}
            />
            <span style={{ fontWeight: 700, color: color }}>{currentPlayer?.name}</span>
            さんが決めます
          </div>
        </div>

        {/* Warning if can't afford */}
        {!canAfford && (
          <div
            style={{
              background: 'rgba(220,38,38,0.08)',
              borderBottom: '1px solid rgba(220,38,38,0.2)',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#DC2626',
              fontWeight: 700,
            }}
          >
            <span>⚠️</span>
            資金が不足しています。購入できません。
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
          }}
        >
          <button
            onClick={() => buyProperty(shop.id)}
            disabled={!canAfford}
            style={{
              padding: '16px',
              background: canAfford
                ? 'linear-gradient(135deg, #E85D04, #C93E0E)'
                : 'rgba(200,200,200,0.5)',
              color: canAfford ? 'white' : '#999',
              border: 'none',
              borderRight: '1px solid rgba(255,255,255,0.15)',
              borderBottomLeftRadius: '20px',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '15px',
              letterSpacing: '0.05em',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={(e) => canAfford && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            🏠 購入する！
          </button>
          <button
            onClick={skipBuyProperty}
            style={{
              padding: '16px',
              background: 'rgba(250,250,248,1)',
              color: '#5a4a2a',
              border: 'none',
              borderBottomRightRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(240,235,225,1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(250,250,248,1)')}
          >
            やめておく
          </button>
        </div>
      </div>
    </div>
  )
}
