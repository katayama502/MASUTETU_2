import { useState } from 'react'

const TYPE_ICONS = {
  shop:  '🏪',
  plus:  '⬆',
  minus: '⬇',
  event: '🎉',
  item:  '🎁',
  start: '🚩',
  goal:  '⭐',
}

// Darker shade of the fill color for borders/text
const TYPE_BORDER_COLORS = {
  shop:  'rgba(180,90,0,0.5)',
  plus:  'rgba(30,120,30,0.4)',
  minus: 'rgba(180,30,30,0.45)',
  event: 'rgba(30,100,160,0.4)',
  item:  'rgba(120,40,140,0.4)',
  start: 'rgba(160,120,0,0.5)',
  goal:  'rgba(160,30,80,0.5)',
}

// Gradient highlight colors per type
const TYPE_HIGHLIGHT = {
  shop:  'rgba(255,220,140,0.5)',
  plus:  'rgba(160,240,160,0.5)',
  minus: 'rgba(255,160,160,0.45)',
  event: 'rgba(160,210,255,0.5)',
  item:  'rgba(220,170,240,0.5)',
  start: 'rgba(255,240,120,0.5)',
  goal:  'rgba(255,180,220,0.5)',
}

const SQ_W = 50
const SQ_H = 38

export default function Square({
  square,
  color,
  isCurrentPlayerHere,
  isLanding,
  isDestination,
  owner,
  onHover,
  onLeave,
}) {
  const { position, label, shortLabel, type, shopId } = square
  const [hovered, setHovered] = useState(false)

  const cx = position.x
  const cy = position.y
  const rx = SQ_W / 2
  const ry = SQ_H / 2

  const icon = TYPE_ICONS[type] || '●'
  const borderColor = TYPE_BORDER_COLORS[type] || 'rgba(0,0,0,0.25)'
  const highlightColor = TYPE_HIGHLIGHT[type] || 'rgba(255,255,255,0.35)'

  const isGoal = type === 'goal'
  const isStart = type === 'start'
  const isShop = type === 'shop'

  const handleMouseEnter = (e) => {
    setHovered(true)
    onHover && onHover(square, e)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    onLeave && onLeave()
  }

  // Prefer shortLabel if available, else truncate label
  const rawLabel = shortLabel || label || ''
  const displayLabel = rawLabel.length > 7 ? rawLabel.slice(0, 7) + '…' : rawLabel

  const isActive = isCurrentPlayerHere || hovered

  return (
    <g
      className={`board-square${isCurrentPlayerHere ? ' board-square--current' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Landing pulse ring */}
      {isLanding && (
        <ellipse
          cx={cx} cy={cy}
          rx={rx + 12} ry={ry + 10}
          fill="none"
          stroke="#E85D04"
          strokeWidth="2.5"
          opacity="0"
          style={{ animation: 'pulseRing 1s ease-out 3' }}
        />
      )}

      {/* Destination glow ring */}
      {isDestination && (
        <ellipse
          cx={cx} cy={cy}
          rx={rx + 8} ry={ry + 7}
          fill="rgba(255,215,0,0.06)"
          stroke="#FFD700"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.8"
        />
      )}

      {/* Current player active ring */}
      {isCurrentPlayerHere && (
        <ellipse
          cx={cx} cy={cy}
          rx={rx + 8} ry={ry + 7}
          fill="none"
          stroke="#E85D04"
          strokeWidth="2"
          opacity="0.65"
          style={{ animation: 'pulseRing 1.5s ease-out infinite' }}
        />
      )}

      {/* Drop shadow */}
      <ellipse
        cx={cx + 2} cy={cy + 5}
        rx={rx - 2} ry={ry - 3}
        fill="rgba(0,0,0,0.15)"
      />

      {/* Main square body */}
      <rect
        x={cx - rx} y={cy - ry}
        width={SQ_W} height={SQ_H}
        rx="9" ry="9"
        fill={color}
        stroke={isActive ? '#E85D04' : isDestination ? '#FFD700' : borderColor}
        strokeWidth={isActive ? 2.5 : isDestination ? 2 : 1.5}
        style={{
          filter: hovered ? 'brightness(1.12)' : isGoal ? 'brightness(1.05)' : 'none',
          transition: 'stroke 0.15s, filter 0.15s',
        }}
      />

      {/* Inner highlight gradient strip */}
      <rect
        x={cx - rx + 3} y={cy - ry + 2}
        width={SQ_W - 6} height={9}
        rx="5" ry="5"
        fill={highlightColor}
      />

      {/* Bottom inner shadow */}
      <rect
        x={cx - rx + 2} y={cy + ry - 7}
        width={SQ_W - 4} height={5}
        rx="3" ry="3"
        fill="rgba(0,0,0,0.08)"
      />

      {/* Goal crown overlay */}
      {isGoal && (
        <text
          x={cx - rx + 6} y={cy - ry + 8}
          fontSize="9"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
          opacity="0.8"
        >
          👑
        </text>
      )}

      {/* Type icon */}
      <text
        x={cx} y={cy - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isGoal || isStart ? '14' : '13'}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {icon}
      </text>

      {/* Label text */}
      <text
        x={cx} y={cy + 11}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="7.5"
        fontWeight="700"
        fill="rgba(26,26,46,0.88)"
        style={{
          fontFamily: 'var(--font-body)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {displayLabel}
      </text>

      {/* Owned indicator — small house on shop squares */}
      {isShop && owner && (
        <text
          x={cx - rx + 5} y={cy - ry + 9}
          fontSize="8"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
          opacity="0.9"
        >
          🏠
        </text>
      )}
    </g>
  )
}
