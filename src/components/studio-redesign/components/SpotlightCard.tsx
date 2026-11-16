import type { CSSProperties, PointerEvent, ReactNode } from "react";

/** Card whose glowing border and inner light follow the pointer. */
export default function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div className={`card ${className}`} onPointerMove={onMove} style={{ "--mx": "50%", "--my": "0%" } as CSSProperties}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
