import { useMemo, useState } from 'react'
import useGameStore from '../store/gameStore'
import boardData from '../data/board.json'
import Square from './Square'
import PlayerToken from './PlayerToken'
import DotabataKun from './DotabataKun'

const SQUARE_TYPE_COLORS = {
  shop:  '#FFB347',
  plus:  '#7DD87D',
  minus: '#FF7070',
  event: '#87CEEB',
  item:  '#DDA0DD',
  start: '#FFD700',
  goal:  '#FF85C2',
}

const SVG_W = 800
const SVG_H = 600

export default function Board() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const landingSquare = useGameStore((s) => s.landingSquare)
  const shopOwners = useGameStore((s) => s.shopOwners ?? {})
  const dotabataActive = useGameStore((s) => s.dotabataActive)
  const dotabataPosition = useGameStore((s) => s.dotabataPosition)

  const squares = useMemo(() => boardData?.squares || [], [])

  const [tooltip, setTooltip] = useState(null)

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

  // Get player positions
  const playersBySquare = useMemo(() => {
    const m = {}
    players.forEach((p) => {
      if (!m[p.position]) m[p.position] = []
      m[p.position].push(p)
    })
    return m
  }, [players])

  const currentPlayer = players[currentPlayerIndex]
  const currentPlayerPosition = currentPlayer?.position

  // Set of destination square IDs (across all players)
  const destinationSquareIds = useMemo(() => {
    const ids = new Set()
    players.forEach((p) => {
      if (p.destination) ids.add(p.destination)
    })
    return ids
  }, [players])

  // Map shopId -> owner player
  const shopOwnerMap = useMemo(() => {
    const m = {}
    Object.entries(shopOwners).forEach(([shopId, playerId]) => {
      const owner = players.find((p) => p.id === playerId)
      if (owner) m[shopId] = owner
    })
    return m
  }, [shopOwners, players])

  const handleSquareHover = (sq) => {
    setTooltip({ sq, x: sq.position.x, y: sq.position.y })
  }
  const handleSquareLeave = () => setTooltip(null)

  return (
    <div
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
      >
        <defs>
          {/* Map-paper texture pattern */}
          <pattern id="boardGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139,105,20,0.1)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="crosshatch" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 L 20 10 M 10 0 L 10 20" fill="none"
              stroke="rgba(139,105,20,0.06)" strokeWidth="0.5"/>
          </pattern>

          {/* Filters */}
          <filter id="squareShadow">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
          <filter id="destGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="ownerGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Gradient for board background */}
          <radialGradient id="boardBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#F9EDD5"/>
            <stop offset="100%" stopColor="#F0DFB8"/>
          </radialGradient>
        </defs>

        {/* Board background — warm map paper */}
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#boardBg)"/>
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#boardGrid)"/>
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#crosshatch)"/>

        {/* Outer border decoration */}
        <rect x="6" y="6" width={SVG_W - 12} height={SVG_H - 12}
          fill="none" stroke="rgba(139,105,20,0.2)" strokeWidth="2" strokeDasharray="10,5" rx="10"/>
        <rect x="10" y="10" width={SVG_W - 20} height={SVG_H - 20}
          fill="none" stroke="rgba(139,105,20,0.08)" strokeWidth="1" rx="8"/>

        {/* Title watermark */}
        <text
          x={SVG_W / 2} y={SVG_H / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="72" fontWeight="900" opacity="0.035"
          fill="#8b6914"
          style={{ fontFamily: 'var(--font-heading)', userSelect: 'none', pointerEvents: 'none' }}
        >
          ます鉄
        </text>

        {/* Connection lines — thicker, rounded */}
        {connections.map(({ from, to, key }) => (
          <line
            key={key}
            x1={from.position.x} y1={from.position.y}
            x2={to.position.x}   y2={to.position.y}
            stroke="#9c7a2a"
            strokeWidth="4"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
        ))}
        {/* Lighter overlay line for depth */}
        {connections.map(({ from, to, key }) => (
          <line
            key={`overlay_${key}`}
            x1={from.position.x} y1={from.position.y}
            x2={to.position.x}   y2={to.position.y}
            stroke="rgba(255,248,220,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Destination highlight rings — behind squares */}
        {squares.map((sq) => {
          if (!destinationSquareIds.has(sq.id)) return null
          return (
            <g key={`destring_${sq.id}`}>
              <circle
                cx={sq.position.x} cy={sq.position.y}
                r={30}
                fill="rgba(255,215,0,0.08)"
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.7"
                className="dest-pulse"
                style={{ transformOrigin: `${sq.position.x}px ${sq.position.y}px` }}
              />
            </g>
          )
        })}

        {/* Squares */}
        {squares.map((sq) => {
          const isCurrentPlayerHere = sq.id === currentPlayerPosition
          const isLanding = landingSquare?.id === sq.id
          const isDestination = destinationSquareIds.has(sq.id)
          // Find owner if shop
          const shopId = sq.shopId
          const owner = shopId ? shopOwnerMap[shopId] : null

          return (
            <Square
              key={sq.id}
              square={sq}
              color={SQUARE_TYPE_COLORS[sq.type] || '#ccc'}
              isCurrentPlayerHere={isCurrentPlayerHere}
              isLanding={isLanding}
              isDestination={isDestination}
              owner={owner}
              onHover={handleSquareHover}
              onLeave={handleSquareLeave}
            />
          )
        })}

        {/* Property ownership markers (colored circles on shop squares) */}
        {squares.map((sq) => {
          if (sq.type !== 'shop' || !sq.shopId) return null
          const owner = shopOwnerMap[sq.shopId]
          if (!owner) return null
          return (
            <g key={`prop_${sq.id}`} className="prop-flag-pop">
              {/* Flag pole */}
              <line
                x1={sq.position.x + 18} y1={sq.position.y - 14}
                x2={sq.position.x + 18} y2={sq.position.y - 26}
                stroke={owner.color || '#ccc'}
                strokeWidth="1.5"
                opacity="0.9"
              />
              {/* Flag */}
              <polygon
                points={`
                  ${sq.position.x + 18},${sq.position.y - 26}
                  ${sq.position.x + 26},${sq.position.y - 23}
                  ${sq.position.x + 18},${sq.position.y - 20}
                `}
                fill={owner.color || '#ccc'}
                opacity="0.9"
              />
              {/* House icon circle */}
              <circle
                cx={sq.position.x + 20} cy={sq.position.y - 14}
                r={5.5}
                fill={owner.color || '#ccc'}
                stroke="white"
                strokeWidth="1.5"
                filter="url(#ownerGlow)"
              />
            </g>
          )
        })}

        {/* Destination markers — target icon above destination squares */}
        {players.map((player) => {
          const destSq = squares.find((s) => s.id === player.destination)
          if (!destSq) return null
          return (
            <g key={`dest_${player.id}`}>
              {/* Player color ring */}
              <circle
                cx={destSq.position.x} cy={destSq.position.y}
                r={27}
                fill="none"
                stroke={player.color || '#FFD700'}
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.5"
              />
              {/* Target text */}
              <text
                x={destSq.position.x}
                y={destSq.position.y - 33}
                textAnchor="middle"
                fontSize="14"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                className="target-pulse"
              >
                🎯
              </text>
            </g>
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

        {/* ドタバタくん */}
        {dotabataActive && (() => {
          const sq = squares.find((s) => s.id === dotabataPosition)
          if (!sq) return null
          return (
            <DotabataKun
              key="dotabata"
              x={sq.position.x - 22}
              y={sq.position.y - 28}
            />
          )
        })()}

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.sq.position.x - 55, 10), SVG_W - 120)
          const ty = tooltip.sq.position.y - 58
          const label = tooltip.sq.label || tooltip.sq.id
          return (
            <g>
              <rect
                x={tx} y={ty}
                width={110} height={28}
                rx="7" fill="rgba(26,26,46,0.9)"
                stroke="rgba(255,215,0,0.3)"
                strokeWidth="1"
              />
              <text
                x={tx + 55} y={ty + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="white"
                style={{ fontFamily: 'var(--font-body)', pointerEvents: 'none', userSelect: 'none' }}
              >
                {label.length > 12 ? label.slice(0, 12) + '…' : label}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Legend */}
      <div
        className="absolute bottom-3 right-3 rounded-xl px-3 py-2 text-xs"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(139,105,20,0.2)',
          fontFamily: 'var(--font-body)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="font-bold mb-1.5 text-xs"
          style={{ color: '#8b6914', fontFamily: 'var(--font-heading)' }}
        >
          マス凡例
        </div>
        {Object.entries(SQUARE_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 mb-0.5">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: color, border: '1px solid rgba(0,0,0,0.15)' }}
            />
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
