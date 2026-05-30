import useGameStore from '../store/gameStore'
import itemsData from '../data/items.json'

const RARITY_COLORS = {
  common: { bg: 'rgba(255,248,230,0.9)', border: 'rgba(139,105,20,0.3)', text: '#8b6914' },
  uncommon: { bg: 'rgba(45,158,107,0.08)', border: 'rgba(45,158,107,0.4)', text: '#2D9E6B' },
  rare: { bg: 'rgba(147,51,234,0.08)', border: 'rgba(147,51,234,0.4)', text: '#9333ea' },
}

function getItemData(itemId) {
  return itemsData.find((it) => it.id === itemId) || {
    id: itemId,
    name: itemId,
    icon: '🎁',
    description: '',
    rarity: 'common',
  }
}

function EffectHint({ effect }) {
  if (!effect) return null
  const hints = {
    double_dice: 'ダブルサイコロ',
    move_to: '指定マスへ移動',
    skip_landing: 'マス効果スキップ',
    money_bonus: 'お金ボーナス',
    steal: 'お金を奪う',
  }
  return (
    <div
      style={{
        fontSize: '8px',
        color: 'rgba(26,26,46,0.55)',
        textAlign: 'center',
        lineHeight: 1.3,
        marginTop: '2px',
      }}
    >
      {hints[effect.type] || effect.type}
    </div>
  )
}

export default function CardHand() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const phase = useGameStore((s) => s.phase)
  const useItem = useGameStore((s) => s.useItem)

  const currentPlayer = players[currentPlayerIndex]
  const cards = currentPlayer?.cards || []
  const canUse = phase === 'rolling' && !currentPlayer?.isBot

  // Show max 5 cards
  const displayCards = cards.slice(0, 5)

  if (currentPlayer?.isBot) return null

  return (
    <div
      style={{
        padding: '8px 10px 10px',
        borderTop: '1px solid rgba(139,105,20,0.15)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#8b6914',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.08em',
          marginBottom: '6px',
          textAlign: 'center',
        }}
      >
        ─ カード手札 ─
      </div>

      {displayCards.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            fontSize: '11px',
            color: 'rgba(139,105,20,0.5)',
            fontFamily: 'var(--font-body)',
            border: '1px dashed rgba(139,105,20,0.25)',
            borderRadius: '10px',
          }}
        >
          カードなし
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            justifyContent: displayCards.length < 4 ? 'center' : 'flex-start',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {displayCards.map((cardId, idx) => {
            const item = getItemData(cardId)
            const rarity = RARITY_COLORS[item.rarity] || RARITY_COLORS.common

            return (
              <div
                key={`${cardId}_${idx}`}
                className="card-item"
                title={canUse ? `使う: ${item.name}` : '今は使えません'}
                onClick={() => {
                  if (canUse && useItem) useItem(cardId)
                }}
                style={{
                  width: '52px',
                  flexShrink: 0,
                  background: canUse ? rarity.bg : 'rgba(220,220,220,0.5)',
                  border: `2px solid ${canUse ? rarity.border : 'rgba(200,200,200,0.4)'}`,
                  borderRadius: '10px',
                  padding: '6px 4px 5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: canUse ? 1 : 0.6,
                  cursor: canUse ? 'pointer' : 'not-allowed',
                  boxShadow: canUse
                    ? '0 2px 8px rgba(0,0,0,0.12)'
                    : 'none',
                  position: 'relative',
                }}
              >
                {/* Rarity dot */}
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '3px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: rarity.text,
                    opacity: 0.7,
                  }}
                />

                {/* Icon */}
                <span style={{ fontSize: '22px', lineHeight: 1, marginBottom: '3px' }}>
                  {item.icon}
                </span>

                {/* Name */}
                <div
                  style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    color: canUse ? rarity.text : '#999',
                    fontFamily: 'var(--font-heading)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    wordBreak: 'break-all',
                  }}
                >
                  {item.name.length > 6 ? item.name.slice(0, 6) + '…' : item.name}
                </div>

                {/* Effect hint */}
                <EffectHint effect={item.effect} />
              </div>
            )
          })}

          {/* More indicator */}
          {cards.length > 5 && (
            <div
              style={{
                width: '52px',
                flexShrink: 0,
                background: 'rgba(139,105,20,0.08)',
                border: '2px dashed rgba(139,105,20,0.25)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#8b6914',
                fontWeight: 700,
              }}
            >
              +{cards.length - 5}
            </div>
          )}
        </div>
      )}

      {/* Phase hint */}
      {!canUse && displayCards.length > 0 && phase !== 'rolling' && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '10px',
            color: 'rgba(139,105,20,0.5)',
            marginTop: '4px',
            fontFamily: 'var(--font-body)',
          }}
        >
          サイコロフェーズで使えます
        </div>
      )}
    </div>
  )
}
