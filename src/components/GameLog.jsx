import { useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'

// Map log entry type to display style
const ENTRY_STYLES = {
  plus:   { color: '#2D9E6B', icon: '💰', bg: 'rgba(45,158,107,0.07)' },
  shop:   { color: '#E85D04', icon: '🏪', bg: 'rgba(232,93,4,0.07)' },
  minus:  { color: '#DC2626', icon: '💸', bg: 'rgba(220,38,38,0.07)' },
  event:  { color: '#1a4fff', icon: '🎉', bg: 'rgba(26,79,255,0.06)' },
  item:   { color: '#9333ea', icon: '🎁', bg: 'rgba(147,51,234,0.06)' },
  roll:   { color: '#8b6914', icon: '🎲', bg: 'transparent' },
  turn:   { color: '#8b6914', icon: '▶', bg: 'transparent' },
  system: { color: '#C93E0E', icon: '⭐', bg: 'rgba(232,93,4,0.06)' },
  info:   { color: '#4a3818', icon: '▪', bg: 'transparent' },
}

export default function GameLog() {
  const log = useGameStore((s) => s.log)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when new entry arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  const recentLog = log.slice(-20)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="text-xs font-bold tracking-widest mb-2 flex-shrink-0"
        style={{ color: '#8b6914', fontFamily: 'var(--font-heading)' }}
      >
        ─ ゲームログ ─
      </div>

      <div
        className="flex-1 overflow-y-auto rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(139,105,20,0.15)',
          minHeight: 0,
        }}
      >
        {recentLog.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-xs text-center p-4"
            style={{ color: '#8b6914', opacity: 0.6, fontFamily: 'var(--font-body)' }}
          >
            ゲームログがここに表示されます
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {recentLog.map((entry, i) => {
              // entry is { id, message, type, timestamp }
              const entryType = entry?.type || 'info'
              const message = entry?.message || String(entry)
              const style = ENTRY_STYLES[entryType] || ENTRY_STYLES.info
              const isLatest = i === recentLog.length - 1

              return (
                <div
                  key={entry?.id ?? i}
                  className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-xs"
                  style={{
                    background: isLatest ? style.bg : 'transparent',
                    borderLeft: isLatest ? `2px solid ${style.color}` : '2px solid transparent',
                    animation: isLatest ? 'slideUp 0.25s ease-out forwards' : 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <span
                    className="flex-shrink-0 mt-0.5"
                    style={{ fontSize: '10px', color: style.color }}
                  >
                    {style.icon}
                  </span>
                  <span
                    style={{
                      color: style.color !== '#4a3818' ? style.color : '#4a3818',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.4,
                      fontWeight: isLatest ? '500' : '400',
                    }}
                  >
                    {message}
                  </span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}
