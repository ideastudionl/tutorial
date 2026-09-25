export function Klaver({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M24 22C24 13 20 7 13.5 7 7.8 7 4 11.2 4 16.4 4 20.6 7.6 22 24 22Z" fill="#1B7F58" />
      <path d="M26 22c0-9 4-15 10.5-15C42.2 7 46 11.2 46 16.4 46 20.6 42.4 22 26 22Z" fill="#2E9B6E" />
      <path d="M24 24C24 33 20 39 13.5 39 7.8 39 4 34.8 4 29.6 4 25.4 7.6 24 24 24Z" fill="#0E4633" />
      <path d="M26 24c0 9 4 15 10.5 15C42.2 39 46 34.8 46 29.6 46 25.4 42.4 24 26 24Z" fill="#7FC0A5" />
      <rect x="23" y="20" width="4" height="6" rx="2" fill="#101614" />
    </svg>
  );
}
