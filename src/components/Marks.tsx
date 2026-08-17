/** Marker's hand: every mark is one drawn stroke set, never a glyph or an icon font. */

interface MarkProps {
  size?: number;
  className?: string;
  title?: string;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

export function Tick({ size = 22, className = "", title }: MarkProps) {
  return (
    <svg
      className={`mark mark-tick ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path {...stroke} strokeWidth="2.1" d="M3.4 12.9c2.2 1 3.9 2.6 5.3 5.1" />
      <path {...stroke} strokeWidth="2.1" d="M8.7 18C11 12.4 14.6 8 20.6 4.6" />
    </svg>
  );
}

export function Cross({ size = 22, className = "", title }: MarkProps) {
  return (
    <svg
      className={`mark mark-cross ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path {...stroke} strokeWidth="2.1" d="M4.6 4.1C9 8.5 14.2 14 19.7 20.2" />
      <path {...stroke} strokeWidth="2.1" d="M19.9 4.4C15.2 8.4 9.8 14.2 4.4 19.8" />
    </svg>
  );
}

/** The examiner's ring around a total. Deliberately open at the top left. */
export function Ring({ className = "" }: { className?: string }) {
  return (
    <svg className={`mark mark-ring ${className}`} viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
      <path
        {...stroke}
        strokeWidth="2.4"
        d="M64 9C33 12 9 30 7 57c-2 30 28 54 76 55 46 1 96-19 106-47C199 37 165 12 118 8"
      />
    </svg>
  );
}

/** Struck-through rule the marker draws under a section total. */
export function Underscore({ className = "" }: { className?: string }) {
  return (
    <svg className={`mark mark-under ${className}`} viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
      <path {...stroke} strokeWidth="2" d="M2 6.5C24 3.4 60 3 118 5.2" />
    </svg>
  );
}
