import React from 'react';

interface AmautaLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mode?: 'light' | 'dark'; // 'light' has dark navy text (#19233C); 'dark' has white text (#FFFFFF)
  variant?: 'full' | 'compact' | 'icon';
  height?: number | string;
  width?: number | string;
}

/**
 * Official Amauta Andean Wordmark Logo
 * Features:
 * - Bold geometric modern typography "Amauta"
 * - Stepped Andean Chakana pyramid inside the capital "A"
 * - Stepped Andean crown on the letter "t"
 * - 5-pyramid Andean mountain motif underneath
 */
export const AmautaLogo: React.FC<AmautaLogoProps> = ({
  className = '',
  mode = 'light',
  variant = 'full',
  height = 'auto',
  width = 'auto',
  ...props
}) => {
  const textColor = mode === 'dark' ? '#FFFFFF' : '#19233C';
  const accentColor = '#EA580C'; // Vibrant Andean Orange
  const accentLight = '#F97316';

  if (variant === 'icon') {
    // Andean 'A' Emblem only
    return (
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ height, width }}
        {...props}
      >
        {/* Outer A shape */}
        <path
          d="M70 12 C74 12 77.5 14.5 79.5 18.5 L126 112 C129 118 124.5 125 117.5 125 H98 C93 125 89 121.5 87.5 116.5 L80 92 H54 L46.5 116.5 C45 121.5 41 125 36 125 H16.5 C9.5 125 5 118 8 112 L54.5 18.5 C56.5 14.5 60 12 64 12 Z M67 48 L58 76 H76 Z"
          fill={textColor}
        />
        {/* Stepped Andean pyramid inside A */}
        <rect x="52" y="80" width="30" height="7" rx="1.5" fill={accentColor} />
        <rect x="58" y="72" width="18" height="7" rx="1.5" fill={accentColor} />
        <rect x="63" y="64" width="8" height="7" rx="1" fill={accentColor} />
      </svg>
    );
  }

  // Full or compact wordmark
  return (
    <svg
      viewBox="0 0 540 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height, width }}
      {...props}
    >
      <defs>
        <linearGradient id={`amauta-orange-grad-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentLight} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>

      {/* === LETTER 'A' === */}
      <path
        d="M62 30 C65.5 30 68.8 32.2 70.3 35.8 L111 133 C113.2 138.2 109.3 144 103.5 144 H88 C83.8 144 80.3 140.9 79 136.8 L71.5 113 H45.5 L38 136.8 C36.7 140.9 33.2 144 29 144 H13.5 C7.7 144 3.8 138.2 6 133 L46.7 35.8 C48.2 32.2 51.5 30 55 30 Z"
        fill={textColor}
      />
      {/* Cutout counter inside A */}
      <path
        d="M58.5 54 L49.5 86 H67.5 Z"
        fill={mode === 'dark' ? '#0F172A' : '#FFFFFF'}
      />
      {/* Stepped Andean Pyramid inside 'A' */}
      <rect x="44" y="98" width="29" height="7" rx="1.5" fill={accentColor} />
      <rect x="49.5" y="90" width="18" height="7" rx="1.5" fill={accentColor} />
      <rect x="54.5" y="82" width="8" height="7" rx="1" fill={accentColor} />

      {/* === LETTER 'm' === */}
      <path
        d="M125 68 C125 63.6 128.6 60 133 60 C137.4 60 141 63.6 141 68 V136 C141 140.4 137.4 144 133 144 C128.6 144 125 140.4 125 136 Z"
        fill={textColor}
      />
      <path
        d="M136 78 C140.5 68.5 150 60 163 60 C175.5 60 184 68 186.5 79 C191.5 68.5 201 60 214 60 C231 60 238 72 238 90 V136 C238 140.4 234.4 144 230 144 C225.6 144 222 140.4 222 136 V93 C222 81.5 217.5 75 208 75 C197.5 75 191 83 191 95 V136 C191 140.4 187.4 144 183 144 C178.6 144 175 140.4 175 136 V93 C175 81.5 170.5 75 161 75 C150.5 75 144 83 144 95 V136 C144 140.4 140.4 144 136 144 C131.6 144 128 140.4 128 136 Z"
        fill={textColor}
      />

      {/* === LETTER 'a' === */}
      <path
        d="M278 60 C299 60 309 72 309 90 V136 C309 140.4 305.4 144 301 144 C296.6 144 293 140.4 293 136 V128 C288.5 138 278.5 145 264 145 C246 145 234 133 234 116 C234 98 248 87 274 86 L293 85 V80 C293 72.5 287.5 67 277 67 C269 67 263.5 70.5 261 74 C259.5 76 256.5 77 254 77 C249.5 77 246 73 246 69 C246 66.5 248 64 251 62 C257.5 56.5 266.5 60 278 60 Z M293 98 L277 99 C260 100 250 106 250 115.5 C250 124.5 258 131 268 131 C282.5 131 293 121 293 107 Z"
        fill={textColor}
      />

      {/* === LETTER 'u' === */}
      <path
        d="M325 68 C325 63.6 328.6 60 333 60 C337.4 60 341 63.6 341 68 V111 C341 123 347.5 130 357.5 130 C368 130 375 122 375 110 V68 C375 63.6 378.6 60 383 60 C387.4 60 391 63.6 391 68 V136 C391 140.4 387.4 144 383 144 C378.6 144 375 140.4 375 136 V126 C370.5 137.5 360.5 145 348 145 C332 145 325 133 325 116 Z"
        fill={textColor}
      />

      {/* === LETTER 't' === */}
      <path
        d="M407 68 H398 C394 68 391 65 391 61 C391 57 394 54 398 54 H407 V45 C407 41 410 38 414 38 C418 38 421 41 421 45 V54 H437 C441 54 444 57 444 61 C444 65 441 68 437 68 H421 V120 C421 127 425 131 432 131 C436 131 439 129.5 441.5 127 C443.5 125 446 124 449 124 C453 124 456 127 456 131 C456 134 454 137.5 450 140.5 C444.5 144.5 437.5 145 429 145 C413 145 407 135 407 121 Z"
        fill={textColor}
      />
      {/* Stepped Andean Crown on top of 't' */}
      <rect x="403" y="47" width="22" height="6.5" rx="1.2" fill={accentColor} />
      <rect x="407" y="39.5" width="14" height="6.5" rx="1.2" fill={accentColor} />
      <rect x="411" y="32" width="6" height="6.5" rx="1" fill={accentColor} />

      {/* === LETTER 'a' (Final) === */}
      <path
        d="M486 60 C507 60 517 72 517 90 V136 C517 140.4 513.4 144 509 144 C504.6 144 501 140.4 501 136 V128 C496.5 138 486.5 145 472 145 C454 145 442 133 442 116 C442 98 456 87 482 86 L501 85 V80 C501 72.5 495.5 67 485 67 C477 67 471.5 70.5 469 74 C467.5 76 464.5 77 462 77 C457.5 77 454 73 454 69 C454 66.5 456 64 459 62 C465.5 56.5 474.5 60 486 60 Z M501 98 L485 99 C468 100 458 106 458 115.5 C458 124.5 466 131 476 131 C490.5 131 501 121 501 107 Z"
        fill={textColor}
      />

      {/* === ANDEAN 5-STEPPED MOUNTAIN MOTIF (UNDERNEATH WORDMARK) === */}
      {variant === 'full' && (
        <g id="andean-mountain-motif">
          {/* Pyramid 1 (Leftmost - Small) */}
          <path
            d="M210 166 L220 152 L230 166 Z"
            fill={accentColor}
          />
          {/* Pyramid 2 (Mid-left - Medium) */}
          <path
            d="M234 166 L247 149 L260 166 Z"
            fill={accentColor}
          />
          {/* Pyramid 3 (Center - Highest / Master) */}
          <path
            d="M264 166 L279 144 L294 166 Z"
            fill={accentColor}
          />
          {/* Pyramid 4 (Mid-right - Medium) */}
          <path
            d="M298 166 L311 149 L324 166 Z"
            fill={accentColor}
          />
          {/* Pyramid 5 (Rightmost - Small) */}
          <path
            d="M328 166 L338 152 L348 166 Z"
            fill={accentColor}
          />
        </g>
      )}
    </svg>
  );
};

export default AmautaLogo;
