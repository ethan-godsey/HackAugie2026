export function LogoIcon({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document */}
      <rect x="3" y="2" width="31" height="40" rx="4" fill="#1A68B3"/>
      {/* Fold corner */}
      <path d="M27 2 L34 9 L27 9 Z" fill="#0D3460"/>
      <rect x="27" y="2" width="7" height="7" rx="0" fill="#1454A0"/>
      {/* Text lines */}
      <rect x="9" y="13" width="16" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)"/>
      <rect x="9" y="19" width="12" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)"/>
      <rect x="9" y="25" width="14" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)"/>
      <rect x="9" y="31" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,0.35)"/>
      {/* Green circle */}
      <circle cx="34" cy="34" r="13" fill="#39B54A"/>
      <circle cx="34" cy="34" r="13" fill="url(#greenGrad)"/>
      {/* Checkmark */}
      <polyline
        points="27,34 31.5,39 41,27"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <radialGradient id="greenGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#4DC95E"/>
          <stop offset="100%" stopColor="#2A9A38"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

export function LogoWordmark({ iconSize = 30 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <LogoIcon size={iconSize} />
      <span style={{
        fontSize: iconSize * 0.72,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>
        <span style={{ color: '#1A68B3' }}>Appeal</span>
        <span style={{ color: '#39B54A' }}>ly</span>
      </span>
    </span>
  );
}

export function LogoFull() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <LogoIcon size={72} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
          <span style={{ color: '#1A68B3' }}>Appeal</span>
          <span style={{ color: '#39B54A' }}>ly</span>
        </div>
        <div style={{
          fontSize: '.8rem',
          color: 'rgba(255,255,255,.45)',
          marginTop: 6,
          letterSpacing: '.02em',
          borderTop: '1px solid rgba(255,255,255,.12)',
          paddingTop: 6,
        }}>
          <span style={{ color: '#1A68B3', fontWeight: 600 }}>Fight Denials.</span>
          {' '}
          <span style={{ color: '#39B54A', fontWeight: 600 }}>Win Your Rights.</span>
        </div>
      </div>
    </div>
  );
}
