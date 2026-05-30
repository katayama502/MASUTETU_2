// DotabataKun — SVG character shown on the board when ドタバタくん is active
export default function DotabataKun({ x, y }) {
  return (
    <g
      className="dotabata-bounce"
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* Shadow */}
      <ellipse cx={x} cy={y + 16} rx={10} ry={4} fill="rgba(0,0,0,0.2)" />

      {/* Body circle */}
      <circle cx={x} cy={y} r={14} fill="#8B0000" opacity="0.9"
        stroke="#FF4444" strokeWidth="1.5" />

      {/* Inner glow */}
      <circle cx={x - 3} cy={y - 3} r={5} fill="rgba(255,100,100,0.3)" />

      {/* Emoji face */}
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="15"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        👺
      </text>

      {/* Name label background */}
      <rect
        x={x - 24} y={y + 17}
        width={48} height={15}
        rx={5} ry={5}
        fill="rgba(139,0,0,0.88)"
        stroke="rgba(255,68,68,0.5)"
        strokeWidth="1"
      />

      {/* Name label text */}
      <text
        x={x} y={y + 27}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="8"
        fontWeight="700"
        fill="white"
        style={{ fontFamily: 'var(--font-body)', userSelect: 'none', pointerEvents: 'none' }}
      >
        ドタバタ
      </text>
    </g>
  )
}
