/**
 * AlumSphereLogo — premium SVG icon component
 * Used everywhere the brand icon appears.
 *
 * Props:
 *   size   – pixel size (default 36)
 *   glow   – whether to show a CSS glow shadow (default true)
 */
export default function AlumSphereLogo({ size = 36, glow = true }) {
  // Unique IDs so multiple instances don't clash in the same DOM
  const uid = `asl-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={
        glow
          ? { filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.55))', flexShrink: 0 }
          : { flexShrink: 0 }
      }
    >
      <defs>
        {/* Main gradient: blue → indigo → violet */}
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1e40af" />
          <stop offset="50%"  stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Top-centre radial highlight */}
        <radialGradient id={`${uid}-shine`} cx="50%" cy="0%" r="70%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Dot-grid pattern */}
        <pattern id={`${uid}-dots`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.65" fill="rgba(255,255,255,0.22)" />
        </pattern>

        {/* Clip to rounded-rect */}
        <clipPath id={`${uid}-clip`}>
          <rect width="40" height="40" rx="10" />
        </clipPath>
      </defs>

      {/* ── Background ─────────────────────────── */}
      <rect width="40" height="40" rx="10" fill={`url(#${uid}-bg)`} />

      {/* Dot-grid overlay */}
      <rect width="40" height="40" rx="10" fill={`url(#${uid}-dots)`} clipPath={`url(#${uid}-clip)`} />

      {/* Radial shine */}
      <rect width="40" height="40" rx="10" fill={`url(#${uid}-shine)`} clipPath={`url(#${uid}-clip)`} />

      {/* Border highlight */}
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5"
            stroke="rgba(255,255,255,0.28)" strokeWidth="1" fill="none" />

      {/* ── Network nodes ──────────────────────── */}
      {/* Top-left node */}
      <circle cx="6.5" cy="6.5" r="2" fill="rgba(255,255,255,0.55)" />
      {/* Top-right node */}
      <circle cx="33.5" cy="6.5" r="2" fill="rgba(255,255,255,0.55)" />
      {/* Top-centre tiny node */}
      <circle cx="20" cy="4.5" r="1.1" fill="rgba(255,255,255,0.4)" />
      {/* Bottom-left faint node */}
      <circle cx="6.5" cy="33.5" r="1.2" fill="rgba(255,255,255,0.22)" />
      {/* Bottom-right faint node */}
      <circle cx="33.5" cy="33.5" r="1.2" fill="rgba(255,255,255,0.22)" />

      {/* ── Connection lines ───────────────────── */}
      {/* Top horizontal edge */}
      <line x1="6.5"  y1="6.5"  x2="33.5" y2="6.5"
            stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
      {/* Left diagonal to centre-top */}
      <line x1="6.5"  y1="6.5"  x2="20"   y2="4.5"
            stroke="rgba(255,255,255,0.2)"  strokeWidth="0.6" />
      {/* Right diagonal to centre-top */}
      <line x1="33.5" y1="6.5"  x2="20"   y2="4.5"
            stroke="rgba(255,255,255,0.2)"  strokeWidth="0.6" />
      {/* Left leg trace (ghost of A) */}
      <line x1="6.5"  y1="6.5"  x2="12"   y2="30"
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      {/* Right leg trace (ghost of A) */}
      <line x1="33.5" y1="6.5"  x2="28"   y2="30"
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />

      {/* ── Letter A (geometric path, no font) ─── */}
      {/* Two legs */}
      <path
        d="M 11.5 30 L 20 10 L 28.5 30"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Crossbar */}
      <line
        x1="15.2" y1="22"
        x2="24.8" y2="22"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
