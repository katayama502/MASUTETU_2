import { useEffect, useRef } from 'react'

const RULES = [
  { icon: '🎲', text: 'サイコロを振って益田市のマスを進もう' },
  { icon: '🏪', text: 'お店マスに止まると地元のお店情報が見られる' },
  { icon: '⬆️', text: 'プラスマスでお金ゲット、マイナスマスで減るよ' },
  { icon: '🎉', text: 'イベントマスでハプニング発生！' },
  { icon: '🏆', text: '12ラウンド後に一番お金が多いプレイヤーが勝ち！' },
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
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)' }} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">

        {/* Title block */}
        <div className="text-center mb-10 animate-pop-in">
          {/* Badge */}
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest"
            style={{
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.4)',
              color: '#FFD700',
              fontFamily: 'var(--font-heading)',
            }}>
            ── 益田市 ボードゲーム ──
          </div>

          {/* Main title */}
          <div className="relative">
            <h1
              className="text-8xl sm:text-9xl font-black leading-none mb-2 select-none"
              style={{
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF9500 30%, #FFD700 60%, #FFF8A0 80%, #FFD700 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 4s linear infinite',
                filter: 'drop-shadow(0 4px 12px rgba(255,215,0,0.35))',
                letterSpacing: '-0.02em',
              }}
            >
              ます鉄
            </h1>
            {/* Train emoji decoration */}
            <div className="absolute -right-8 top-2 text-4xl"
              style={{ animation: 'wiggle 2s ease-in-out infinite' }}>
              🚃
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-bold mt-3 mb-1"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'rgba(255,248,230,0.9)',
              letterSpacing: '0.15em',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
            益田市をめぐる旅
          </p>
          <p className="text-sm opacity-60 tracking-widest"
            style={{ color: 'rgba(255,248,230,0.7)', fontFamily: 'var(--font-body)' }}>
            MASUDA CITY BOARD GAME
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-10 opacity-50">
          <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, #FFD700)' }} />
          <span className="text-yellow-400 text-lg">✦</span>
          <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, #FFD700)' }} />
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="btn-primary text-xl px-12 py-4 mb-12 relative overflow-hidden"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            letterSpacing: '0.1em',
            minWidth: '220px',
          }}
        >
          <span className="relative z-10">ゲームをはじめる</span>
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' }} />
        </button>

        {/* Rules card */}
        <div
          className="w-full max-w-lg rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h2 className="text-center text-sm font-bold mb-4 tracking-widest"
            style={{ color: 'rgba(255,215,0,0.8)', fontFamily: 'var(--font-heading)' }}>
            ─ あそびかた ─
          </h2>
          <ul className="space-y-2.5">
            {RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm"
                style={{ color: 'rgba(255,248,230,0.85)', fontFamily: 'var(--font-body)' }}>
                <span className="text-base flex-shrink-0 mt-0.5">{rule.icon}</span>
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Animated train at bottom */}
      <div className="relative h-16 overflow-hidden flex-shrink-0"
        style={{ borderTop: '2px solid rgba(255,215,0,0.15)' }}>
        {/* Track lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 opacity-30"
          style={{
            background: 'repeating-linear-gradient(to right, #FFD700 0px, #FFD700 20px, transparent 20px, transparent 30px)',
          }} />
        {/* Train */}
        <div
          ref={trainRef}
          className="absolute top-1/2 -translate-y-1/2 text-3xl select-none"
          style={{ animation: 'trainRide 7s linear infinite', left: 0 }}
        >
          🚃🚃🚃
        </div>
      </div>
    </div>
  )
}
