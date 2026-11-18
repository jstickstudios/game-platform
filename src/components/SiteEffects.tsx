"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SiteEffects() {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) return;
    const move = (event: PointerEvent) => {
      const x = `${event.clientX}px`;
      const y = `${event.clientY}px`;
      if (cursorRef.current) {
        cursorRef.current.style.setProperty("--x", x);
        cursorRef.current.style.setProperty("--y", y);
      }
      if (ringRef.current) {
        ringRef.current.style.setProperty("--x", x);
        ringRef.current.style.setProperty("--y", y);
      }
    };
    const down = () => document.documentElement.classList.add("cursor-pressed");
    const up = () => document.documentElement.classList.remove("cursor-pressed");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("cursor-pressed");
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("route-changing");
    document.documentElement.classList.add("route-arrived");
    const timer = window.setTimeout(() => document.documentElement.classList.remove("route-arrived"), 520);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.hash) return;
      if (url.pathname !== window.location.pathname) document.documentElement.classList.add("route-changing");
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);

  return (
    <>
      <span ref={cursorRef} className="jstick-cursor-dot" aria-hidden="true" />
      <span ref={ringRef} className="jstick-cursor-ring" aria-hidden="true" />
      <span className="jstick-route-progress" aria-hidden="true" />
    </>
  );
}
