import { useEffect, useRef, useState } from 'react'

const PLAYER_COLORS = {
  orange: '#E85D04',
  blue:   '#1a4fff',
  green:  '#2D9E6B',
  purple: '#9333ea',
}

export default function PlayerToken({ player, x, y, isCurrent }) {
  const [bouncing, setBouncing] = useState(false)
  const prevPos = useRef({ x, y })

  useEffect(() => {
    if (prevPos.current.x !== x || prevPos.current.y !== y) {
      setBouncing(true)
      const t = setTimeout(() => setBouncing(false), 700)
      prevPos.current = { x, y }
      return () => clearTimeout(t)
    }
  }, [x, y])

  const color = player.color
    ? (PLAYER_COLORS[player.color] || player.color)
    : '#E85D04'

  // Get first character (works with Japanese names)
  const initial = player.name ? Array.from(player.name)[0] : '?'

  return (
    <g
      style={{
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: isCurrent ? `drop-shadow(0 0 6px ${color})` : 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
      }}
    >
      {/* Current player indicator ring */}
      {isCurrent && (
        <circle
          cx={x} cy={y}
          r={13}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.7"
          style={{ animation: 'pulseRing 1.4s ease-out infinite' }}
        />
      )}

      {/* Token shadow */}
      <ellipse
        cx={x + 1} cy={y + 11}
        rx={8} ry={3}
        fill="rgba(0,0,0,0.25)"
      />

      {/* Token circle */}
      <circle
        cx={x} cy={y}
        r={10}
        fill={color}
        stroke="white"
        strokeWidth="2.5"
        style={{
          animation: bouncing ? 'tokenBounce 0.6s ease-out' : 'none',
        }}
      />

      {/* Inner highlight */}
      <circle
        cx={x - 2} cy={y - 3}
        r={4}
        fill="rgba(255,255,255,0.3)"
      />

      {/* Player initial */}
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={initial && initial.charCodeAt(0) > 127 ? '8' : '9'}
        fontWeight="900"
        fill="white"
        style={{
          fontFamily: 'var(--font-heading)',
          userSelect: 'none',
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        {initial}
      </text>

      {/* Bot indicator */}
      {player.isBot && (
        <text
          x={x + 8} y={y - 8}
          fontSize="8"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          🤖
        </text>
      )}
    </g>
  )
}
