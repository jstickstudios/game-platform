import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  children: ReactNode;
  id?: string;
  align?: "left" | "center";
};

/** Section heading with an animated eyebrow line and glowing underline bar. */
export default function SectionHeading({ eyebrow, children, id, align = "left" }: Props) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto text-center" : ""}>
      <div className={`flex items-center gap-4 ${center ? "justify-center" : ""}`}>
        <span className="eyebrow-line" aria-hidden="true" />
        <p className="font-display text-xs font-medium uppercase tracking-[0.32em] text-glow sm:text-sm">{eyebrow}</p>
        {center && <span className="eyebrow-line rotate-180" aria-hidden="true" />}
      </div>
      <h2
        id={id}
        className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        {children}
      </h2>
      <span className={`hl-bar ${center ? "mx-auto" : ""}`} aria-hidden="true" />
    </Reveal>
  );
}
