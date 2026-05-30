export default function MoneyPopup({ amount }) {
  if (amount === 0) return null

  const isPositive = amount > 0
  const formatted = '¥' + Math.abs(amount).toLocaleString('ja-JP')
  const display = (isPositive ? '+' : '-') + formatted

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
        animation: 'moneyFloat 1.8s ease-out forwards',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 900,
          color: isPositive ? '#2D9E6B' : '#DC2626',
          textShadow: isPositive
            ? '0 2px 8px rgba(45,158,107,0.5)'
            : '0 2px 8px rgba(220,38,38,0.5)',
          padding: '4px 10px',
          borderRadius: '999px',
          background: isPositive
            ? 'rgba(45,158,107,0.15)'
            : 'rgba(220,38,38,0.15)',
          border: `1.5px solid ${isPositive ? 'rgba(45,158,107,0.4)' : 'rgba(220,38,38,0.4)'}`,
          backdropFilter: 'blur(4px)',
          letterSpacing: '0.03em',
        }}
      >
        {display}
      </div>
    </div>
  )
}
