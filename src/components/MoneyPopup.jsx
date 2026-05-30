export default function MoneyPopup({ amount, isRent = false }) {
  if (amount === 0) return null

  const isPositive = amount > 0
  const formatted = '¥' + Math.abs(amount).toLocaleString('ja-JP')
  const display = (isPositive ? '+' : '−') + formatted

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
        animation: 'moneyBigFloat 2s ease-out forwards',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Outer glow ring for big amounts */}
      {Math.abs(amount) >= 5000 && (
        <div
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '999px',
            background: isPositive
              ? 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: Math.abs(amount) >= 10000 ? '1.65rem' : Math.abs(amount) >= 3000 ? '1.35rem' : '1.15rem',
          fontWeight: 900,
          color: isPositive ? '#1a8a4a' : '#DC2626',
          textShadow: isPositive
            ? '0 2px 10px rgba(45,158,107,0.6), 0 0 20px rgba(255,215,0,0.3)'
            : '0 2px 10px rgba(220,38,38,0.55)',
          padding: '5px 14px',
          borderRadius: '999px',
          background: isPositive
            ? 'linear-gradient(135deg, rgba(45,158,107,0.18), rgba(255,215,0,0.12))'
            : 'rgba(220,38,38,0.12)',
          border: `2px solid ${isPositive ? 'rgba(45,158,107,0.45)' : 'rgba(220,38,38,0.4)'}`,
          backdropFilter: 'blur(6px)',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        {/* Rent/income prefix icon */}
        {isRent && !isPositive && (
          <span style={{ fontSize: '0.75em' }}>🏠</span>
        )}
        {isPositive && Math.abs(amount) >= 10000 && (
          <span style={{ fontSize: '0.8em' }}>✨</span>
        )}
        {display}
      </div>
    </div>
  )
}
