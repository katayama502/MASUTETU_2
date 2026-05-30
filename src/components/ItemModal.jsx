import useGameStore from '../store/gameStore'

const RARITY_CONFIG = {
  common:   { label: 'コモン',   color: '#8b6914', bg: 'rgba(139,105,20,0.1)',   border: 'rgba(139,105,20,0.3)' },
  uncommon: { label: 'アンコモン', color: '#2D9E6B', bg: 'rgba(45,158,107,0.1)',  border: 'rgba(45,158,107,0.3)' },
  rare:     { label: 'レア',     color: '#1a4fff', bg: 'rgba(26,79,255,0.1)',    border: 'rgba(26,79,255,0.3)' },
  epic:     { label: 'エピック',  color: '#9333ea', bg: 'rgba(147,51,234,0.1)',  border: 'rgba(147,51,234,0.3)' },
}

const EFFECT_LABEL = {
  shield:       'マイナス効果を1回防ぐ',
  resist:       'ダメージを半減する',
  double_dice:  'サイコロを2個振り、大きい目を使う',
  dice_bonus:   'サイコロの目にボーナスが加わる',
  money:        'お金が変化する',
  move:         'マスを移動する',
  move_to:      '指定マスへ進む',
  teleport:     '好きなマスへワープする',
  skip:         'ターンをスキップする',
  skip_landing: '次のマスの効果を無効にする',
  steal:        '他のプレイヤーからお金を奪う',
}

export default function ItemModal() {
  const activeItem = useGameStore((s) => s.activeItem)
  const dismissItem = useGameStore((s) => s.dismissItem)
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)

  if (!activeItem) return null

  const rarity = activeItem.rarity || 'common'
  const cfg = RARITY_CONFIG[rarity] || RARITY_CONFIG.common
  const currentPlayer = players[currentPlayerIndex]
  const effectLabel = EFFECT_LABEL[activeItem.effect?.type] || 'アイテム効果'

  return (
    <div className="modal-backdrop flex items-end sm:items-center justify-center p-4">
      <div
        className="modal-content w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 text-center"
          style={{
            background: `linear-gradient(135deg, ${cfg.bg.replace('0.1', '0.6')}, ${cfg.bg})`,
            borderBottom: `2px solid ${cfg.border}`,
          }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-1"
            style={{ color: cfg.color, fontFamily: 'var(--font-heading)' }}
          >
            ─ アイテムゲット！─
          </div>
          <div className="text-5xl mb-2">{activeItem.icon || '🎁'}</div>
          <div
            className="text-xl font-black"
            style={{ fontFamily: 'var(--font-heading)', color: '#1a1a2e' }}
          >
            {activeItem.name}
          </div>
          {/* Rarity badge */}
          <div
            className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Player who got the item */}
          {currentPlayer && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}
            >
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ background: currentPlayer.color }}
              />
              <span>
                <strong>{currentPlayer.name}</strong> がアイテムを手に入れた！
              </span>
            </div>
          )}

          {/* Description */}
          {activeItem.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#4a3818', fontFamily: 'var(--font-body)' }}
            >
              {activeItem.description}
            </p>
          )}

          {/* Effect */}
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-2"
            style={{
              background: cfg.bg,
              border: `1.5px solid ${cfg.border}`,
            }}
          >
            <span className="text-lg flex-shrink-0">✨</span>
            <div>
              <div
                className="text-xs font-bold mb-0.5"
                style={{ color: cfg.color, fontFamily: 'var(--font-heading)' }}
              >
                効果
              </div>
              <div
                className="text-sm"
                style={{ color: '#1a1a2e', fontFamily: 'var(--font-body)' }}
              >
                {effectLabel}
              </div>
            </div>
          </div>

          {/* Usage note */}
          <div
            className="text-xs text-center"
            style={{ color: '#8b6914', fontFamily: 'var(--font-body)', opacity: 0.8 }}
          >
            アイテムは自分のターンに使えます
          </div>

          {/* OK button */}
          <button
            onClick={dismissItem}
            className="btn-primary w-full py-3"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              letterSpacing: '0.05em',
            }}
          >
            🎒 もらった！
          </button>
        </div>
      </div>
    </div>
  )
}
