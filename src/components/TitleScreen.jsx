import { useRef } from 'react'

const FEATURES = [
  { icon: '🗺️', title: '益田市の名所を巡る', desc: '高津川・雪舟の庭・石見神楽…益田の魅力が詰まった27マス' },
  { icon: '🏪', title: '地元のお店を購入', desc: '物件を買って年収入でライバルを引き離そう！' },
  { icon: '🎯', title: '目的地に到達せよ', desc: '目的地に一番多く到達したプレイヤーが有利' },
]

const RULES = [
  { icon: '🎲', text: 'サイコロを振って益田市のマスを進もう' },
  { icon: '🏪', text: 'お店マスに止まると地元のお店情報が見られる' },
  { icon: '⬆️', text: 'プラスマスでお金ゲット、マイナスマスで減るよ' },
  { icon: '🎉', text: 'イベントマスでハプニング発生！' },
  { icon: '🎯', text: '目的地到達でボーナス獲得！' },
  { icon: '🏆', text: '全年終了後に一番お金が多いプレイヤーが勝ち！' },
]

export default function TitleScreen({ onStart }) {
  const trainRef = useRef(null)

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0d1b4b 40%, #16213e 100%)',
      }}
    >
      {/* Japanese grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,215,0,0.07) 49px, rgba(255,215,0,0.07) 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,215,0,0.07) 49px, rgba(255,215,0,0.07) 50px)
          `,
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.18) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)' }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        {/* Title block */}
        <div className="text-center mb-8 animate-pop-in">
          {/* Badge */}
          <div
            className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest"
            style={{
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.4)',
              color: '#FFD700',
              fontFamily: 'var(--font-heading)',
            }}
          >
            ── 益田市 ボードゲーム ──
          </div>

          {/* Main title */}
          <div className="relative inline-block">
            <h1
              className="text-8xl sm:text-9xl font-black leading-none mb-2 select-none"
              style={{
                fontFamily: 'var(--font-heading)',
                background:
                  'linear-gradient(135deg, #FFD700 0%, #FF9500 30%, #FFD700 60%, #FFF8A0 80%, #FFD700 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 4s linear infinite',
                filter: 'drop-shadow(0 4px 16px rgba(255,215,0,0.35))',
                letterSpacing: '-0.02em',
              }}
            >
              ます鉄
            </h1>
            {/* Train emoji decoration */}
            <div
              className="absolute -right-10 top-2 text-4xl"
              style={{ animation: 'wiggle 2s ease-in-out infinite' }}
            >
              🚃
            </div>
          </div>

          {/* Subtitle */}
          <p
            className="text-xl sm:text-2xl font-bold mt-3 mb-1"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'rgba(255,248,230,0.9)',
              letterSpacing: '0.15em',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              animation: 'slideInRight 0.6s ease-out 0.3s both',
            }}
          >
            益田市をめぐる旅
          </p>
          <p
            className="text-sm opacity-60 tracking-widest"
            style={{ color: 'rgba(255,248,230,0.7)', fontFamily: 'var(--font-body)' }}
          >
            MASUDA CITY BOARD GAME
          </p>

          {/* Version */}
          <p
            className="text-xs mt-2 opacity-30 tracking-widest"
            style={{ color: 'rgba(255,248,230,0.7)', fontFamily: 'var(--font-body)' }}
          >
            益田市電鉄 v1.0
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-8 opacity-50">
          <div
            className="h-px w-20"
            style={{ background: 'linear-gradient(to right, transparent, #FFD700)' }}
          />
          <span className="text-yellow-400 text-lg">✦</span>
          <div
            className="h-px w-20"
            style={{ background: 'linear-gradient(to left, transparent, #FFD700)' }}
          />
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="btn-primary text-xl px-12 py-4 mb-10 relative overflow-hidden"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            letterSpacing: '0.1em',
            minWidth: '220px',
            boxShadow: '0 6px 30px rgba(232,93,4,0.5), 0 0 0 0 rgba(232,93,4,0.4)',
          }}
        >
          <span className="relative z-10">🎲 ゲームをはじめる</span>
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' }}
          />
        </button>

        {/* 3 features section */}
        <div className="w-full max-w-lg mb-8">
          <div
            className="text-center text-xs font-bold tracking-widest mb-4"
            style={{ color: 'rgba(255,215,0,0.6)', fontFamily: 'var(--font-heading)' }}
          >
            ─ 3つのポイント ─
          </div>
          <div className="grid grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(4px)',
                  animation: `slideInRight 0.4s ease-out ${0.1 * i}s both`,
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.icon}</div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFD700',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '4px',
                    lineHeight: 1.3,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255,248,230,0.6)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.4,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules card */}
        <div
          className="w-full max-w-lg rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h2
            className="text-center text-xs font-bold mb-3 tracking-widest"
            style={{ color: 'rgba(255,215,0,0.7)', fontFamily: 'var(--font-heading)' }}
          >
            ─ あそびかた ─
          </h2>
          <ul className="space-y-2">
            {RULES.map((rule, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-xs"
                style={{ color: 'rgba(255,248,230,0.82)', fontFamily: 'var(--font-body)' }}
              >
                <span className="text-sm flex-shrink-0 mt-0.5">{rule.icon}</span>
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Animated train at bottom — 3 cars */}
      <div
        className="relative h-16 overflow-hidden flex-shrink-0"
        style={{ borderTop: '2px solid rgba(255,215,0,0.15)' }}
      >
        {/* Track ties */}
        <div
          className="absolute inset-x-0"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            height: '6px',
            background:
              'repeating-linear-gradient(to right, rgba(255,215,0,0.25) 0px, rgba(255,215,0,0.25) 20px, transparent 20px, transparent 32px)',
          }}
        />
        {/* Rails */}
        <div
          className="absolute inset-x-0"
          style={{
            top: 'calc(50% - 4px)',
            height: '2px',
            background: 'rgba(255,215,0,0.35)',
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            top: 'calc(50% + 2px)',
            height: '2px',
            background: 'rgba(255,215,0,0.35)',
          }}
        />

        {/* Train — 3 cars */}
        <div
          ref={trainRef}
          className="absolute top-1/2 -translate-y-1/2 select-none"
          style={{
            animation: 'trainRide 9s linear infinite',
            left: 0,
            fontSize: '28px',
            lineHeight: 1,
            letterSpacing: '-4px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          }}
        >
          🚂🚃🚃
        </div>

        {/* Second train (offset) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 select-none"
          style={{
            animation: 'trainRide 9s linear 4.5s infinite',
            left: 0,
            fontSize: '22px',
            lineHeight: 1,
            letterSpacing: '-3px',
            opacity: 0.5,
          }}
        >
          🚃🚃
        </div>
      </div>
    </div>
  )
}
