/** The "L:" mark from the app icon, on its graphite tile. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      role="img"
      aria-hidden="true"
      style={{ borderRadius: size * 0.24 }}>
      <defs>
        <linearGradient id="leads-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C1E22" />
          <stop offset="1" stopColor="#070809" />
        </linearGradient>
        <linearGradient id="leads-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FAFAFB" />
          <stop offset="1" stopColor="#D6D8DC" />
        </linearGradient>
        <linearGradient id="leads-dot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7AA5FF" />
          <stop offset="1" stopColor="#346CEC" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="230" fill="url(#leads-tile)" />
      <rect x="338" y="300" width="70" height="388" rx="14" fill="url(#leads-ink)" />
      <rect x="338" y="624" width="252" height="64" rx="14" fill="url(#leads-ink)" />
      <rect x="624" y="402" width="76" height="76" rx="18" fill="url(#leads-dot)" />
      <rect x="624" y="612" width="76" height="76" rx="18" fill="url(#leads-dot)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      LEADS<span className="wordmark-colon">:</span>
    </span>
  );
}
