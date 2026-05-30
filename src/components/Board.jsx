import { useMemo, useState, useRef, useEffect } from 'react'
import useGameStore from '../store/gameStore'
import boardData from '../data/board.json'
import Square from './Square'
import PlayerToken from './PlayerToken'

const SQUARE_TYPE_COLORS = {
  shop:  '#FFB347',
  plus:  '#90EE90',
  minus: '#FF6B6B',
  event: '#87CEEB',
  item:  '#DDA0DD',
  start: '#FFD700',
  goal:  '#FF69B4',
}

const SVG_W = 800
const SVG_H = 600

export default function Board() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const landingSquare = useGameStore((s) => s.landingSquare)

  const squares = useMemo(() => boardData?.squares || [], [])

  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  // Build a map for quick lookup
  const squareMap = useMemo(() => {
    const m = {}
    squares.forEach((sq) => { m[sq.id] = sq })
    return m
  }, [squares])

  // Build connection lines (de-duplicate)
  const connections = useMemo(() => {
    const lines = []
    const seen = new Set()
    squares.forEach((sq) => {
      if (!sq.connections) return
      sq.connections.forEach((toId) => {
        const key = [sq.id, toId].sort().join('__')
        if (!seen.has(key)) {
          seen.add(key)
          const to = squareMap[toId]
          if (to && sq.position && to.position) {
            lines.push({ from: sq, to, key })
          }
        }
      })
    })
    return lines
  }, [squares, squareMap])

  const handleSquareHover = (sq, e) => {
    setTooltip({ sq, x: sq.position.x, y: sq.position.y })
  }

  const handleSquareLeave = () => {
    setTooltip(null)
  }

  // Get player positions
  const playersBySquare = useMemo(() => {
    const m = {}
    players.forEach((p) => {
      if (!m[p.position]) m[p.position] = []
      m[p.position].push(p)
    })
    return m
  }, [players])

  const currentPlayerPosition = players[currentPlayerIndex]?.position

  return (
    <div
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Board background */}
        <defs>
          <pattern id="boardGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139,105,20,0.12)" strokeWidth="0.5"/>
          </pattern>
          <filter id="squareShadow">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#F5ECD7" rx="0"/>
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#boardGrid)"/>

        {/* Subtle border decoration */}
        <rect x="8" y="8" width={SVG_W - 16} height={SVG_H - 16}
          fill="none" stroke="rgba(139,105,20,0.25)" strokeWidth="1.5" strokeDasharray="8,4" rx="8"/>

        {/* Title watermark */}
        <text
          x={SVG_W / 2} y={SVG_H / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="64" fontWeight="900" opacity="0.04"
          fill="#8b6914"
          style={{ fontFamily: 'var(--font-heading)', userSelect: 'none', pointerEvents: 'none' }}
        >
          ます鉄
        </text>

        {/* Connection lines */}
        {connections.map(({ from, to, key }) => (
          <line
            key={key}
            x1={from.position.x} y1={from.position.y}
            x2={to.position.x}   y2={to.position.y}
            stroke="#8b6914"
            strokeWidth="3"
            strokeOpacity="0.35"
            strokeLinecap="round"
            strokeDasharray="none"
          />
        ))}

        {/* Squares */}
        {squares.map((sq) => {
          const isCurrentPlayerHere = sq.id === currentPlayerPosition
          const isLanding = landingSquare?.id === sq.id
          return (
            <Square
              key={sq.id}
              square={sq}
              color={SQUARE_TYPE_COLORS[sq.type] || '#ccc'}
              isCurrentPlayerHere={isCurrentPlayerHere}
              isLanding={isLanding}
              onHover={handleSquareHover}
              onLeave={handleSquareLeave}
            />
          )
        })}

        {/* Player tokens */}
        {squares.map((sq) => {
          const playersHere = playersBySquare[sq.id] || []
          return playersHere.map((p, pi) => (
            <PlayerToken
              key={p.id}
              player={p}
              x={sq.position.x + (pi - (playersHere.length - 1) / 2) * 14}
              y={sq.position.y - 22}
              isCurrent={players[currentPlayerIndex]?.id === p.id}
            />
          ))
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.sq.position.x - 50, SVG_W - 110)}
              y={tooltip.sq.position.y - 54}
              width={Math.min(100, SVG_W - 20)}
              height={26}
              rx="6"
              fill="rgba(26,26,46,0.88)"
            />
            <text
              x={Math.min(tooltip.sq.position.x, SVG_W - 60)}
              y={tooltip.sq.position.y - 37}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              style={{ fontFamily: 'var(--font-body)', pointerEvents: 'none', userSelect: 'none' }}
            >
              {tooltip.sq.label?.length > 10 ? tooltip.sq.label.slice(0, 10) + '…' : tooltip.sq.label}
            </text>
          </g>
        )}
      </svg>

      {/* Square type legend */}
      <div
        className="absolute bottom-3 right-3 rounded-xl px-3 py-2 text-xs"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(139,105,20,0.2)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div className="font-bold mb-1.5 text-xs"
          style={{ color: '#8b6914', fontFamily: 'var(--font-heading)' }}>
          マス凡例
        </div>
        {Object.entries(SQUARE_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color, border: '1px solid rgba(0,0,0,0.15)' }} />
            <span style={{ color: '#4a3818' }}>{typeLabel(type)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function typeLabel(type) {
  const map = {
    shop:  '🏪 お店',
    plus:  '⬆ プラス',
    minus: '⬇ マイナス',
    event: '🎉 イベント',
    item:  '🎁 アイテム',
    start: '🚩 スタート',
    goal:  '⭐ ゴール',
  }
  return map[type] || type
}
