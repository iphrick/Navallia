interface RazorIconProps {
  className?: string;
}

/** Ícone de navalha de barbeiro (straight razor) — SVG customizado */
export function RazorIcon({ className }: RazorIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cabo da navalha */}
      <rect
        x="2" y="10.5" width="7" height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Pivô */}
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      {/* Lâmina aberta */}
      <path
        d="M10 7 L21.5 10.5 L21.5 13.5 L10 17 L10 7Z"
        fill="currentColor"
      />
      {/* Fio da lâmina (edge) */}
      <path
        d="M10 7 L21.5 12"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
      {/* Guarda (spine) */}
      <path
        d="M10 17 L21.5 13.5"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />
    </svg>
  );
}
