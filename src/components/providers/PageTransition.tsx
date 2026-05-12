"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "in" | "hold" | "out">("idle");
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setPhase("in");

      const t1 = setTimeout(() => setPhase("hold"), 150);
      const t2 = setTimeout(() => setPhase("out"), 900);
      const t3 = setTimeout(() => setPhase("idle"), 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname]);

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("efatech-transition-portal");
    if (!el) {
      el = document.createElement("div");
      el.id = "efatech-transition-portal";
      document.body.appendChild(el);
    }
    setPortalRoot(el);
  }, []);

  const showOverlay = phase !== "idle";
  const isOut = phase === "out";

  return (
    <>
      {showOverlay && portalRoot && (
        <TransitionPortal container={portalRoot} isOut={isOut} />
      )}
      {children}
    </>
  );
}

function TransitionPortal({ container, isOut }: { container: HTMLElement; isOut: boolean }) {
  const [el] = useState(() => document.createElement("div"));

  useEffect(() => {
    container.appendChild(el);
    return () => {
      container.removeChild(el);
    };
  }, [container, el]);

  useEffect(() => {
    el.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      transition: opacity 0.4s ease;
      opacity: ${isOut ? "0" : "1"};
      pointer-events: ${isOut ? "none" : "auto"};
    `;
  }, [el, isOut]);

  useEffect(() => {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px;animation:efatechScale 0.35s ease-out;">
        <img src="/images/transition.png" alt="Efatech" width="200" height="200" style="object-fit:contain;filter:drop-shadow(0 0 40px rgba(0,176,80,0.4));" />
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
          <p style="color:rgba(255,255,255,0.9);font-size:20px;font-weight:600;letter-spacing:3px;margin:0;font-family:inherit;">
            Efatech <span style="color:#28a745;">PRO</span>
          </p>
          <div style="display:flex;gap:6px;">
            <span style="width:8px;height:8px;border-radius:50%;background:#28a745;animation:efatechDot 0.8s ease-in-out infinite 0s;"></span>
            <span style="width:8px;height:8px;border-radius:50%;background:#28a745;animation:efatechDot 0.8s ease-in-out infinite 0.15s;"></span>
            <span style="width:8px;height:8px;border-radius:50%;background:#28a745;animation:efatechDot 0.8s ease-in-out infinite 0.3s;"></span>
          </div>
        </div>
      </div>
      <style>
        @keyframes efatechScale{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes efatechDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
      </style>
    `;
  }, [el]);

  return null;
}
