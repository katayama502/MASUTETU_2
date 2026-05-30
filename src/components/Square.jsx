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

const SQ_W = 48
const SQ_H = 36

export default function Square({
  square,
  color,
  isCurrentPlayerHere,
  isLanding,
  onHover,
  onLeave,
}) {
  const { position, label, type } = square
  const [hovered, setHovered] = useState(false)

  const cx = position.x
  const cy = position.y
  const rx = SQ_W / 2
  const ry = SQ_H / 2

  const icon = TYPE_ICONS[type] || '●'

  const handleMouseEnter = (e) => {
    setHovered(true)
    onHover && onHover(square, e)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    onLeave && onLeave()
  }

  // Truncate label for display
  const displayLabel = label?.length > 6 ? label.slice(0, 6) + '…' : (label || '')

  return (
    <g
      className="board-square"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Landing pulse ring */}
      {isLanding && (
        <ellipse
          cx={cx} cy={cy}
          rx={rx + 10} ry={ry + 10}
          fill="none"
          stroke="#E85D04"
          strokeWidth="2.5"
          opacity="0"
          style={{ animation: 'pulseRing 1s ease-out 3' }}
        />
      )}

      {/* Current player pulse ring */}
      {isCurrentPlayerHere && (
        <ellipse
          cx={cx} cy={cy}
          rx={rx + 7} ry={ry + 7}
          fill="none"
          stroke="#E85D04"
          strokeWidth="2"
          opacity="0.6"
          style={{ animation: 'pulseRing 1.5s ease-out infinite' }}
        />
      )}

      {/* Square shadow */}
      <ellipse
        cx={cx + 2} cy={cy + 4}
        rx={rx - 1} ry={ry - 2}
        fill="rgba(0,0,0,0.18)"
      />

      {/* Main square body */}
      <rect
        x={cx - rx} y={cy - ry}
        width={SQ_W} height={SQ_H}
        rx="8" ry="8"
        fill={color}
        stroke={hovered || isCurrentPlayerHere ? '#E85D04' : 'rgba(0,0,0,0.22)'}
        strokeWidth={hovered || isCurrentPlayerHere ? 2.5 : 1.5}
        style={{
          filter: hovered ? 'brightness(1.12)' : 'none',
          transition: 'stroke 0.15s, filter 0.15s',
        }}
      />

      {/* Inner highlight */}
      <rect
        x={cx - rx + 3} y={cy - ry + 2}
        width={SQ_W - 6} height={8}
        rx="4" ry="4"
        fill="rgba(255,255,255,0.35)"
      />

      {/* Type icon */}
      <text
        x={cx} y={cy - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {icon}
      </text>

      {/* Label text */}
      <text
        x={cx} y={cy + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="8"
        fontWeight="700"
        fill="rgba(26,26,46,0.85)"
        style={{
          fontFamily: 'var(--font-body)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {displayLabel}
      </text>
    </g>
  )
}
