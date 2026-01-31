import React, { useEffect, useMemo, useState } from "react";

const icons = {
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4M3 9h18" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 8.5L13 13l-4.5 2.5L11 11z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
    </svg>
  ),
};

const ICON_KEYS = ["calendar", "compass", "check", "ticket"] as const;
const CELL_SIZE = 180;
const BASE_ICON_SIZE = 38;
const ICON_VARIANCE = 7;

const getSeededFloat = (seed: number) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};

const AnimatedBackground = () => {
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  useEffect(() => {
    const updateGrid = () => {
      const cols = Math.max(1, Math.ceil(window.innerWidth / CELL_SIZE));
      const rows = Math.max(1, Math.ceil(window.innerHeight / CELL_SIZE));
      setGrid({ cols, rows });
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, []);

  const items = useMemo(() => {
    const total = grid.cols * grid.rows;
    return Array.from({ length: total }, (_, index) => {
      const seed = index + 1;
      const driftX = 6 + Math.round(getSeededFloat(seed) * 8);
      const driftY = 6 + Math.round(getSeededFloat(seed * 2) * 8);
      const rotate = Math.round(getSeededFloat(seed * 3) * 6) - 3;
      const duration = 18 + Math.round(getSeededFloat(seed * 4) * 12);
      const delay = -Math.round(getSeededFloat(seed * 5) * 12);
      const size = BASE_ICON_SIZE + Math.round(getSeededFloat(seed * 6) * ICON_VARIANCE);

      return {
        icon: ICON_KEYS[index % ICON_KEYS.length],
        duration: `${duration}s`,
        delay: `${delay}s`,
        driftX: `${driftX}px`,
        driftY: `${-driftY}px`,
        rotate: `${rotate}deg`,
        size,
      };
    });
  }, [grid.cols, grid.rows]);

  return (
    <div className="animated-bg" aria-hidden="true">
      {/* Icon grid fills the viewport; each icon animates subtly with seeded variation. */}
      <div
        className="icon-grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, ${CELL_SIZE}px)`,
          gridAutoRows: `${CELL_SIZE}px`,
        }}
      >
        {items.map((item, index) => (
          <span
            key={`${item.icon}-${index}`}
            className="bg-icon"
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
              animationDuration: item.duration,
              animationDelay: item.delay,
              "--float-x": item.driftX,
              "--float-y": item.driftY,
              "--float-rotate": item.rotate,
            } as React.CSSProperties}
          >
            {icons[item.icon]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
