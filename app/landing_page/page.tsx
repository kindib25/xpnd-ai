"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Tokens & helpers                                                   */
/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const C = {
  blue: "#4F7DFF",
  purple: "#7C5CFF",
  lime: "#B6FF3B",
  green: "#7EEB2A",
  violet: "#A855F7",
  navy: "#080A18",
  off: "#F5F7FF",
} as const;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mql.matches);
    mql.addEventListener("change", handler);

    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/* ------------------------------------------------------------------ */
/* Styles — MOBILE FIRST                                             */
/* ------------------------------------------------------------------ */

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.xpnd,
.xpnd * {
  box-sizing: border-box;
}

.xpnd {
  --navy: #080A18;
  --off: #F5F7FF;
  --blue: #4F7DFF;
  --purple: #7C5CFF;
  --lime: #B6FF3B;
  --green: #7EEB2A;
  --violet: #A855F7;

  --nav-h: 62px;
  --gut-l: max(20px, env(safe-area-inset-left));
  --gut-r: max(20px, env(safe-area-inset-right));

  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  background: var(--navy);
  color: var(--off);
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  overflow-x: clip;
}

.xpnd ::selection {
  background: rgba(124, 92, 255, 0.35);
  color: #fff;
}

.xpnd a {
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.xpnd :focus-visible {
  outline: 2px solid var(--lime);
  outline-offset: 3px;
  border-radius: 6px;
}

/* ================================================================== */
/* Backdrop layers                                                     */
/* ================================================================== */

.xpnd-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(
      to right,
      rgba(245, 247, 255, 0.04) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      rgba(245, 247, 255, 0.04) 1px,
      transparent 1px
    );
  background-size: 44px 44px;
  -webkit-mask-image:
    radial-gradient(
      ellipse 140% 62% at 50% 0%,
      #000 4%,
      transparent 76%
    );
  mask-image:
    radial-gradient(
      ellipse 140% 62% at 50% 0%,
      #000 4%,
      transparent 76%
    );
}

.xpnd-noise {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.045;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>");
}

.xpnd-aurora-wrap {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.xpnd-aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(64px);
  will-change: transform, opacity;
}

.xpnd-aurora.a1 {
  width: 320px;
  height: 320px;
  top: -110px;
  left: -110px;
  background:
    radial-gradient(
      circle,
      rgba(79, 125, 255, 0.55),
      transparent 68%
    );
  animation: xpndDrift1 22s ease-in-out infinite alternate;
}

.xpnd-aurora.a2 {
  width: 360px;
  height: 360px;
  top: -90px;
  right: -130px;
  background:
    radial-gradient(
      circle,
      rgba(124, 92, 255, 0.5),
      transparent 68%
    );
  animation: xpndDrift2 26s ease-in-out infinite alternate;
}

.xpnd-aurora.a3 {
  display: none;
}

@keyframes xpndDrift1 {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(60px, 44px, 0) scale(1.1);
  }
}

@keyframes xpndDrift2 {
  from {
    transform: translate3d(0, 0, 0) scale(1.05);
  }

  to {
    transform: translate3d(-66px, 52px, 0) scale(0.95);
  }
}

@keyframes xpndDrift3 {
  from {
    transform: translate3d(-50px, 0, 0) scale(0.95);
    opacity: 0.55;
  }

  to {
    transform: translate3d(60px, -70px, 0) scale(1.1);
    opacity: 0.8;
  }
}

/* ================================================================== */
/* Layout                                                              */
/* ================================================================== */

.xpnd-main {
  position: relative;
  z-index: 3;
}

.xpnd-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding-left: var(--gut-l);
  padding-right: var(--gut-r);
}

.xpnd-section {
  position: relative;
  padding: 76px 0;
  scroll-margin-top: calc(var(--nav-h) + 16px);
}

.xpnd-rule {
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(245, 247, 255, 0.1) 30%,
      rgba(245, 247, 255, 0.1) 70%,
      transparent
    );
}

/* ================================================================== */
/* Typography                                                          */
/* ================================================================== */

.xpnd-h1 {
  margin: 0;
  font-size: clamp(2.15rem, 8.6vw, 3.05rem);
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -0.036em;
}

.xpnd-h2 {
  margin: 0;
  font-size: clamp(1.65rem, 6.2vw, 2.15rem);
  font-weight: 600;
  line-height: 1.14;
  letter-spacing: -0.03em;
}

.xpnd-h3 {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.018em;
}

.xpnd-body {
  margin: 0;
  font-size: 1rem;
  line-height: 1.62;
  color: rgba(245, 247, 255, 0.62);
  font-weight: 400;
}

.xpnd-sub {
  margin: 16px 0 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(245, 247, 255, 0.55);
  max-width: 56ch;
}

.grad-text {
  background:
    linear-gradient(
      100deg,
      #4F7DFF 0%,
      #7C5CFF 42%,
      #B6FF3B 100%
    );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

/* ================================================================== */
/* Eyebrow                                                             */
/* ================================================================== */

.xpnd-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 13px 0 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: rgba(245, 247, 255, 0.78);
  background: rgba(245, 247, 255, 0.045);
  border: 1px solid rgba(245, 247, 255, 0.1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  max-width: 100%;
}

.xpnd-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--lime);
  box-shadow:
    0 0 10px 2px rgba(182, 255, 59, 0.7);
  animation: xpndPulse 2.4s ease-in-out infinite;
  flex: none;
}

@keyframes xpndPulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

/* ================================================================== */
/* Buttons                                                             */
/* ================================================================== */

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.012em;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.3s ease,
    border-color 0.3s ease,
    background-position 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.btn:active {
  transform: scale(0.972);
}

.btn-ghost {
  color: rgba(245, 247, 255, 0.92);
  background: rgba(245, 247, 255, 0.045);
  border-color: rgba(245, 247, 255, 0.13);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.btn-primary {
  color: #060814;
  background-image:
    linear-gradient(
      100deg,
      #4F7DFF 0%,
      #7C5CFF 46%,
      #B6FF3B 100%
    );
  background-size: 200% 100%;
  background-position: 0% 50%;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    0 10px 30px -12px rgba(79, 125, 255, 0.85),
    0 0 0 0 rgba(124, 92, 255, 0);
}

.btn-sm {
  height: 42px;
  padding: 0 15px;
  font-size: 13.5px;
}

/* ================================================================== */
/* Glass surfaces                                                      */
/* ================================================================== */

.glass {
  position: relative;
  background:
    linear-gradient(
      180deg,
      rgba(245, 247, 255, 0.062),
      rgba(245, 247, 255, 0.018)
    );
  border: 1px solid rgba(245, 247, 255, 0.09);
  border-radius: 20px;
  backdrop-filter: blur(20px) saturate(130%);
  -webkit-backdrop-filter: blur(20px) saturate(130%);
  overflow: hidden;
}

.glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      rgba(245, 247, 255, 0.09),
      transparent 42%
    );
  opacity: 0.7;
}

.spot::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
  background:
    radial-gradient(
      360px circle at var(--mx, 50%) var(--my, 50%),
      rgba(124, 92, 255, 0.22),
      rgba(79, 125, 255, 0.1) 40%,
      transparent 72%
    );
}

/* ================================================================== */
/* Navigation                                                          */
/* ================================================================== */

.xpnd-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  border-bottom: 1px solid transparent;
  padding-top: env(safe-area-inset-top);
  transition:
    background-color 0.45s ease,
    border-color 0.45s ease,
    backdrop-filter 0.45s ease;
}

.xpnd-nav[data-scrolled="true"] {
  background: rgba(8, 10, 24, 0.72);
  border-bottom-color: rgba(245, 247, 255, 0.07);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

.xpnd-nav-inner {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.xpnd-logo {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.026em;
  color: var(--off);
  min-width: 0;
}

.xpnd-logo svg {
  display: block;
  flex: none;
}

.xpnd-logo span {
  display: none;
}

.xpnd-nav-links {
  display: none;
}

.xpnd-nav-cta {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

.xpnd-hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: calc(var(--nav-h) + 56px) 0 84px;
  text-align: center;
  scroll-margin-top: 0;
}

.xpnd-hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
}

.xpnd-hero-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 92% 48% at 50% 38%,
      rgba(8, 10, 24, 0.88),
      transparent 74%
    ),
    linear-gradient(
      180deg,
      rgba(8, 10, 24, 0.62) 0%,
      transparent 22%,
      transparent 54%,
      rgba(8, 10, 24, 0.96) 100%
    );
}

.xpnd-hero-content {
  position: relative;
  z-index: 2;
  max-width: 620px;
  margin: 0 auto;
}

.xpnd-hero-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin-top: 30px;
}

.xpnd-hero-actions .btn {
  width: 100%;
}

.xpnd-hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 16px;
  margin-top: 28px;
  font-size: 12px;
  color: rgba(245, 247, 255, 0.42);
  letter-spacing: 0.005em;
}

.xpnd-hero-meta span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.xpnd-hero-meta i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(245, 247, 255, 0.28);
  display: inline-block;
}

/* ================================================================== */
/* Section head                                                        */
/* ================================================================== */

.xpnd-sechead {
  max-width: 660px;
  margin-bottom: 40px;
}

.xpnd-sechead .xpnd-h2 {
  margin-top: 18px;
}

/* ================================================================== */
/* Features                                                            */
/* ================================================================== */

.xpnd-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.xpnd-card {
  position: relative;
  padding: 24px 22px 28px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.45s ease;
}

.xpnd-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  background:
    linear-gradient(
      150deg,
      rgba(79, 125, 255, 0.18),
      rgba(124, 92, 255, 0.1)
    );
  border: 1px solid rgba(245, 247, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
}

.xpnd-card h3,
.xpnd-card p {
  position: relative;
  z-index: 1;
}

.xpnd-card p {
  margin: 12px 0 0;
  font-size: 14.5px;
  line-height: 1.62;
  color: rgba(245, 247, 255, 0.55);
}

/* ================================================================== */
/* Ledger preview                                                      */
/* ================================================================== */

.xpnd-ledger {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  overflow: hidden;
}

.xpnd-ledger-main {
  padding: 22px 20px 24px;
  position: relative;
  z-index: 1;
}

.xpnd-ledger-side {
  padding: 22px 20px 26px;
  border-top: 1px solid rgba(245, 247, 255, 0.07);
  background:
    linear-gradient(
      180deg,
      rgba(124, 92, 255, 0.05),
      transparent 60%
    );
  position: relative;
  z-index: 1;
}

.xpnd-ledger-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.xpnd-ledger-total {
  font-size: clamp(1.75rem, 8vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1;
}

.xpnd-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: rgba(182, 255, 59, 0.95);
  background: rgba(182, 255, 59, 0.09);
  border: 1px solid rgba(182, 255, 59, 0.22);
  white-space: nowrap;
}

.xpnd-spark {
  margin: 22px -4px 6px;
  display: block;
  width: calc(100% + 8px);
  height: 96px;
}

.xpnd-rows {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 8px;
}

.xpnd-row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.xpnd-row-label {
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(245, 247, 255, 0.86);
}

.xpnd-row-value {
  font-size: 13px;
  font-weight: 500;
  color: rgba(245, 247, 255, 0.42);
  font-variant-numeric: tabular-nums;
}

.xpnd-bar-track {
  height: 6px;
  border-radius: 999px;
  background: rgba(245, 247, 255, 0.07);
  overflow: hidden;
}

.xpnd-bar-fill {
  height: 100%;
  border-radius: 999px;
  transform-origin: left center;
  box-shadow: 0 0 14px -2px currentColor;
}

.xpnd-ai-note {
  margin-top: 22px;
  padding: 15px 16px;
  border-radius: 15px;
  border: 1px solid rgba(124, 92, 255, 0.22);
  background:
    linear-gradient(
      140deg,
      rgba(124, 92, 255, 0.13),
      rgba(79, 125, 255, 0.05)
    );
  font-size: 13.5px;
  line-height: 1.6;
  color: rgba(245, 247, 255, 0.78);
}

.xpnd-ai-note strong {
  color: #fff;
  font-weight: 600;
}

/* ================================================================== */
/* Steps                                                               */
/* ================================================================== */

.xpnd-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  position: relative;
}

.xpnd-step {
  position: relative;
  padding: 24px 22px 28px;
  border-radius: 20px;
  border: 1px solid rgba(245, 247, 255, 0.07);
  background: rgba(245, 247, 255, 0.018);
  transition:
    border-color 0.4s ease,
    background-color 0.4s ease;
}

.xpnd-step-num {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  background:
    linear-gradient(
      100deg,
      #4F7DFF,
      #7C5CFF 50%,
      #B6FF3B
    );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.xpnd-step h3 {
  margin: 16px 0 0;
}

.xpnd-step p {
  margin: 10px 0 0;
  font-size: 14.5px;
  line-height: 1.62;
  color: rgba(245, 247, 255, 0.52);
}

/* ================================================================== */
/* Stats                                                               */
/* ================================================================== */

.xpnd-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: rgba(245, 247, 255, 0.07);
  border: 1px solid rgba(245, 247, 255, 0.07);
  border-radius: 20px;
  overflow: hidden;
}

.xpnd-stat {
  padding: 26px 22px;
  background: #090c1c;
  transition: background-color 0.4s ease;
}

.xpnd-stat-num {
  font-size: clamp(1.6rem, 7vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.038em;
  line-height: 1;
}

.xpnd-stat-label {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(245, 247, 255, 0.45);
}

/* ================================================================== */
/* Final CTA                                                           */
/* ================================================================== */

.xpnd-cta {
  position: relative;
  padding: 44px 22px 46px;
  border-radius: 24px;
  text-align: center;
  overflow: hidden;
}

.xpnd-cta-glow {
  position: absolute;
  width: 460px;
  height: 300px;
  left: 50%;
  top: -140px;
  transform: translateX(-50%);
  background:
    radial-gradient(
      ellipse at center,
      rgba(124, 92, 255, 0.42),
      rgba(79, 125, 255, 0.16) 45%,
      transparent 72%
    );
  filter: blur(46px);
  pointer-events: none;
}

.xpnd-cta-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.xpnd-cta-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 340px;
  margin: 28px auto 0;
}

.xpnd-cta-actions .btn {
  width: 100%;
}

/* ================================================================== */
/* Footer                                                              */
/* ================================================================== */

.xpnd-footer {
  position: relative;
  z-index: 3;
  padding:
    42px
    0
    calc(38px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(245, 247, 255, 0.07);
}

.xpnd-footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 22px;
}

.xpnd-footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 22px;
}

.xpnd-footer-links a {
  font-size: 13px;
  color: rgba(245, 247, 255, 0.42);
  transition: color 0.25s ease;
  padding: 4px 0;
}

.xpnd-copy {
  font-size: 12.5px;
  color: rgba(245, 247, 255, 0.3);
}

/* ================================================================== */
/* Responsive                                                          */
/* ================================================================== */

@media (min-width: 380px) {
  .xpnd-logo span {
    display: inline;
  }
}

@media (min-width: 480px) {
  .xpnd-hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 34px;
  }

  .xpnd-hero-actions .btn {
    width: auto;
  }

  .xpnd-cta-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: auto;
    max-width: none;
    margin-top: 32px;
  }

  .xpnd-cta-actions .btn {
    width: auto;
  }

  .xpnd-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 641px) {
  .xpnd {
    --nav-h: 68px;
    --gut-l: max(24px, env(safe-area-inset-left));
    --gut-r: max(24px, env(safe-area-inset-right));
  }

  .xpnd-grid {
    background-size: 68px 68px;
    -webkit-mask-image:
      radial-gradient(
        ellipse 90% 55% at 50% 0%,
        #000 5%,
        transparent 78%
      );
    mask-image:
      radial-gradient(
        ellipse 90% 55% at 50% 0%,
        #000 5%,
        transparent 78%
      );
  }

  .xpnd-noise {
    opacity: 0.05;
  }

  .xpnd-aurora {
    filter: blur(100px);
  }

  .xpnd-aurora.a1 {
    width: 620px;
    height: 620px;
    top: -220px;
    left: -140px;
  }

  .xpnd-aurora.a2 {
    width: 680px;
    height: 680px;
    top: -180px;
    right: -200px;
  }

  .xpnd-aurora.a3 {
    display: block;
    width: 520px;
    height: 520px;
    top: 620px;
    left: 42%;
    background:
      radial-gradient(
        circle,
        rgba(168, 85, 247, 0.28),
        transparent 70%
      );
    animation: xpndDrift3 30s ease-in-out infinite alternate;
  }

  .xpnd-section {
    padding: clamp(96px, 12vw, 168px) 0;
  }

  .xpnd-h1 {
    font-size: clamp(2.65rem, 6.6vw, 5rem);
    line-height: 1.03;
    letter-spacing: -0.042em;
  }

  .xpnd-h2 {
    font-size: clamp(1.85rem, 3.8vw, 3rem);
    line-height: 1.1;
    letter-spacing: -0.035em;
  }

  .xpnd-body {
    font-size: clamp(1rem, 1.35vw, 1.125rem);
    line-height: 1.65;
  }

  .xpnd-sub {
    margin-top: 18px;
    font-size: clamp(0.95rem, 1.3vw, 1.0625rem);
  }

  .xpnd-eyebrow {
    height: 32px;
    padding: 0 14px 0 12px;
    font-size: 12.5px;
    gap: 9px;
  }

  .btn {
    height: 46px;
    padding: 0 24px;
    font-size: 14.5px;
  }

  .btn-sm {
    height: 40px;
    padding: 0 18px;
    font-size: 13.5px;
  }

  .glass {
    border-radius: 22px;
  }

  .xpnd-ledger {
    border-radius: 22px;
  }

  .xpnd-sechead {
    margin-bottom: clamp(44px, 6vw, 72px);
  }

  .xpnd-sechead .xpnd-h2 {
    margin-top: 22px;
  }

  .xpnd-grid-3 {
    gap: 18px;
  }

  .xpnd-card {
    padding: 30px 28px 34px;
    min-height: 240px;
  }

  .xpnd-card-icon {
    width: 46px;
    height: 46px;
    margin-bottom: 26px;
  }

  .xpnd-ledger-main {
    padding: 34px 34px 30px;
  }

  .xpnd-ledger-side {
    padding: 34px 34px 30px;
  }

  .xpnd-spark {
    margin: 26px -4px 8px;
    height: 118px;
  }

  .xpnd-rows {
    gap: 20px;
  }

  .xpnd-ai-note {
    margin-top: 26px;
    padding: 16px 18px;
  }

  .xpnd-steps {
    gap: 18px;
  }

  .xpnd-step {
    padding: 30px 26px 34px;
  }

  .xpnd-step h3 {
    margin-top: 20px;
  }

  .xpnd-stat {
    padding: 34px 26px;
  }

  .xpnd-stat-num {
    font-size: clamp(1.75rem, 3vw, 2.35rem);
  }

  .xpnd-stat-label {
    margin-top: 12px;
  }

  .xpnd-cta {
    padding:
      clamp(48px, 7vw, 84px)
      clamp(26px, 5vw, 76px);
    border-radius: 28px;
  }

  .xpnd-cta-glow {
    width: 720px;
    height: 420px;
    top: -160px;
    filter: blur(50px);
  }

  .xpnd-footer {
    padding: 54px 0 44px;
  }

  .xpnd-footer-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    gap: 24px;
    flex-wrap: wrap;
  }

  .xpnd-footer-links {
    justify-content: flex-start;
    gap: 26px;
  }
}

@media (min-width: 900px) {
  .xpnd {
    --nav-h: 74px;
  }

  .xpnd-nav-inner {
    gap: 20px;
  }

  .xpnd-nav-links {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-left: auto;
    margin-right: 12px;
  }

  .xpnd-nav-links a {
    font-size: 13.5px;
    font-weight: 500;
    color: rgba(245, 247, 255, 0.58);
    transition: color 0.25s ease;
  }

  .xpnd-nav-cta {
    gap: 10px;
  }

  .xpnd-hero {
    text-align: left;
    padding: 150px 0 110px;
  }

  .xpnd-hero-canvas {
    opacity: 1;
  }

  .xpnd-hero-scrim {
    background:
      radial-gradient(
        ellipse 70% 55% at 22% 45%,
        rgba(8, 10, 24, 0.88),
        transparent 72%
      ),
      linear-gradient(
        180deg,
        rgba(8, 10, 24, 0.55) 0%,
        transparent 26%,
        transparent 62%,
        rgba(8, 10, 24, 0.95) 100%
      );
  }

  .xpnd-hero-content {
    max-width: 660px;
    margin: 0;
  }

  .xpnd-hero-actions {
    justify-content: flex-start;
    gap: 12px;
    margin-top: 36px;
  }

  .xpnd-hero-meta {
    justify-content: flex-start;
    gap: 10px 22px;
    margin-top: 34px;
    font-size: 12.5px;
  }

  .xpnd-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .xpnd-steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .xpnd-ledger {
    grid-template-columns: 1.15fr 0.85fr;
  }

  .xpnd-ledger-side {
    border-top: none;
    border-left: 1px solid rgba(245, 247, 255, 0.07);
  }
}

@media (min-width: 1000px) {
  .xpnd-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* ================================================================== */
/* Hover                                                               */
/* ================================================================== */

@media (hover: hover) and (pointer: fine) {
  .btn-ghost:hover {
    background: rgba(245, 247, 255, 0.09);
    border-color: rgba(245, 247, 255, 0.26);
    transform: translateY(-1px);
  }

  .btn-primary:hover {
    background-position: 100% 50%;
    transform: translateY(-1px);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 18px 44px -14px rgba(124, 92, 255, 0.95),
      0 0 0 6px rgba(124, 92, 255, 0.07);
  }

  .spot:hover::before {
    opacity: 1;
  }

  .xpnd-card:hover {
    transform: translateY(-4px);
    border-color: rgba(245, 247, 255, 0.17);
  }

  .xpnd-step:hover {
    border-color: rgba(245, 247, 255, 0.15);
    background: rgba(245, 247, 255, 0.035);
  }

  .xpnd-stat:hover {
    background: #0c1024;
  }

  .xpnd-nav-links a:hover {
    color: rgba(245, 247, 255, 0.96);
  }

  .xpnd-footer-links a:hover {
    color: rgba(245, 247, 255, 0.9);
  }
}

/* ================================================================== */
/* Reduced motion                                                      */
/* ================================================================== */

@media (prefers-reduced-motion: reduce) {
  .xpnd-aurora {
    animation: none !important;
  }

  .xpnd-dot {
    animation: none !important;
  }

  .btn,
  .xpnd-card,
  .xpnd-step,
  .xpnd-stat {
    transition-duration: 0.01ms !important;
  }

  .btn-primary {
    background-position: 0% 50% !important;
  }
}
`;

/* ------------------------------------------------------------------ */
/* WebGL scene                                                        */
/* ------------------------------------------------------------------ */

const ORB_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vDisp;

  float wave(vec3 p, float t) {
    return sin(p.x * 1.9 + t * 0.9)
         * sin(p.y * 2.3 - t * 0.72)
         * sin(p.z * 1.7 + t * 1.12);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);

    float d = wave(position, uTime) * 0.155;
    vDisp = d;

    vec3 displaced = position + normal * d;
    vPos = normalize(position);

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(displaced, 1.0);
  }
`;

const ORB_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vDisp;

  void main() {
    float fres =
      pow(
        1.0 -
        abs(
          dot(
            normalize(vNormal),
            vec3(0.0, 0.0, 1.0)
          )
        ),
        2.1
      );

    float h =
      clamp(
        vPos.y * 0.5 + 0.5,
        0.0,
        1.0
      );

    vec3 base =
      mix(
        uColorA,
        uColorB,
        smoothstep(0.04, 0.62, h)
      );

    base =
      mix(
        base,
        uColorC,
        smoothstep(0.68, 1.0, h)
      );

    vec3 col =
      base *
      (0.34 + 0.90 * fres);

    col += uColorC * fres * 0.22;
    col += vDisp * 1.15;

    float alpha =
      0.26 + 0.58 * fres;

    gl_FragColor =
      vec4(col, alpha);
  }
`;

function OrbCore({
  reduce,
  detail = 22,
}: {
  reduce: boolean;
  detail?: number;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(C.blue) },
      uColorB: { value: new THREE.Color(C.purple) },
      uColorC: { value: new THREE.Color(C.lime) },
    }),
    []
  );

  useFrame((state, delta) => {
    if (reduce) return;

    const t = state.clock.elapsedTime;

    uniforms.uTime.value = t;

    const core = coreRef.current;

    if (core) {
      core.rotation.y += delta * 0.14;
      core.rotation.x =
        Math.sin(t * 0.24) * 0.13;
    }

    const shell = shellRef.current;

    if (shell) {
      shell.rotation.y -= delta * 0.075;
      shell.rotation.z += delta * 0.038;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.34, detail]} />

        <shaderMaterial
          uniforms={uniforms}
          vertexShader={ORB_VERT}
          fragmentShader={ORB_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={shellRef} scale={1.62}>
        <icosahedronGeometry args={[1.34, 1]} />

        <meshBasicMaterial
          color={C.blue}
          wireframe
          transparent
          opacity={0.11}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Particles({
  count = 520,
  reduce,
}: {
  count?: number;
  reduce: boolean;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius =
        2.4 + Math.random() * 3.6;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      arr[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      arr[i * 3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta) *
        0.68;

      arr[i * 3 + 2] =
        radius *
        Math.cos(phi) *
        0.6 -
        0.6;
    }

    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (reduce || !ref.current) return;

    ref.current.rotation.y +=
      delta * 0.024;

    ref.current.rotation.x =
      Math.sin(
        state.clock.elapsedTime * 0.12
      ) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.022}
        sizeAttenuation
        color="#9DB4FF"
        transparent
        opacity={0.72}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig({
  children,
  reduce,
  offsetX,
}: {
  children: ReactNode;
  reduce: boolean;
  offsetX: number;
}) {
  const group =
    useRef<THREE.Group>(null);

  const target =
    useRef(
      new THREE.Vector2(
        offsetX,
        0.12
      )
    );

  useEffect(() => {
    target.current.set(
      offsetX,
      0.12
    );
  }, [offsetX]);

  useFrame((state, delta) => {
    const g = group.current;

    if (!g) return;

    const k =
      reduce
        ? 1
        : 1 -
          Math.pow(
            0.0022,
            Math.min(delta, 0.05)
          );

    g.position.x +=
      (target.current.x -
        g.position.x) *
      k;

    g.position.y +=
      (target.current.y -
        g.position.y) *
      k;

    if (!reduce) {
      const rk =
        Math.min(
          1,
          delta * 2.6
        );

      g.rotation.y +=
        (
          state.pointer.x *
            0.34 -
          g.rotation.y
        ) * rk;

      g.rotation.x +=
        (
          -state.pointer.y *
            0.2 -
          g.rotation.x
        ) * rk;
    }
  });

  return (
    <group
      ref={group}
      position={[
        offsetX,
        0.12,
        0,
      ]}
    >
      {children}
    </group>
  );
}

function Scene({
  reduce,
  offsetX,
  isMobile,
}: {
  reduce: boolean;
  offsetX: number;
  isMobile: boolean;
}) {
  return (
    <Canvas
      dpr={
        isMobile
          ? [1, 1.5]
          : [1, 1.75]
      }
      camera={{
        position: [0, 0, 5.3],
        fov: 45,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference:
          "high-performance",
      }}
      frameloop={
        reduce
          ? "demand"
          : "always"
      }
      style={{
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Rig
        reduce={reduce}
        offsetX={offsetX}
      >
        <OrbCore
          reduce={reduce}
          detail={
            isMobile
              ? 14
              : 22
          }
        />

        <Particles
          reduce={reduce}
          count={
            isMobile
              ? 240
              : 520
          }
        />
      </Rig>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce =
    !!useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={
        reduce
          ? { opacity: 0 }
          : {
              opacity: 0,
              y,
            }
      }
      whileInView={
        reduce
          ? { opacity: 1 }
          : {
              opacity: 1,
              y: 0,
            }
      }
      viewport={{
        once: true,
        margin: "-60px",
      }}
      transition={{
        duration:
          reduce
            ? 0.25
            : 0.8,
        delay:
          reduce
            ? 0
            : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

function SpotlightCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref =
    useRef<HTMLDivElement>(null);

  const onMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const el = ref.current;

    if (!el) return;

    const r =
      el.getBoundingClientRect();

    el.style.setProperty(
      "--mx",
      `${e.clientX - r.left}px`
    );

    el.style.setProperty(
      "--my",
      `${e.clientY - r.top}px`
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`glass spot ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function Logo({
  size = 26,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="25"
        height="25"
        rx="8"
        fill="url(#xpndMark)"
      />

      <path
        d="M7.6 17.9 L13 8.1 L18.4 17.9"
        stroke="#080A18"
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10.3 14.7 H15.7"
        stroke="#080A18"
        strokeWidth="2.05"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GradientDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{
        position: "absolute",
      }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="xpndMark"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={C.blue}
          />
          <stop
            offset="52%"
            stopColor={C.purple}
          />
          <stop
            offset="100%"
            stopColor={C.lime}
          />
        </linearGradient>

        <linearGradient
          id="xpndStroke"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={C.blue}
          />
          <stop
            offset="55%"
            stopColor={C.purple}
          />
          <stop
            offset="100%"
            stopColor={C.lime}
          />
        </linearGradient>
      </defs>
    </svg>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "url(#xpndStroke)",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="xpnd-sechead">
      <Reveal>
        <span className="xpnd-eyebrow">
          <span className="xpnd-dot" />
          {eyebrow}
        </span>
      </Reveal>

      <Reveal delay={0.07}>
        <h2 className="xpnd-h2">
          {title}
        </h2>
      </Reveal>

      {sub ? (
        <Reveal delay={0.13}>
          <p className="xpnd-sub">
            {sub}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

function Nav() {
  const router =
    useRouter();

  const { scrollY } =
    useScroll();

  const [scrolled, setScrolled] =
    useState(false);

  useMotionValueEvent(
    scrollY,
    "change",
    (v) => {
      setScrolled(v > 22);
    }
  );

  return (
    <header
      className="xpnd-nav"
      data-scrolled={scrolled}
    >
      <nav
        className="xpnd-container xpnd-nav-inner"
        aria-label="Primary"
      >
        <a
          className="xpnd-logo"
          href="#top"
          aria-label="Xpnd AI home"
        >
          <div className="flex justify-center pt-[5%]">
            <img
              src="/xpnd-ai-logo-dark.svg"
              alt="Xpnd AI"
              className="h-auto w-[100px] md:w-[120px]"
            />
          </div>
        </a>

        <div className="xpnd-nav-links">
          <a href="#features">
            Features
          </a>

          <a href="#how">
            How it works
          </a>

          <a href="#intelligence">
            Dashboard
          </a>
        </div>

        <div className="xpnd-nav-cta">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              router.push(
                "/auth/login"
              )
            }
          >
            Log In
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() =>
              router.push(
                "/auth/sign-up"
              )
            }
          >
            Sign Up
          </button>
        </div>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({
  reduce,
  isDesktop,
  isMobile,
}: {
  reduce: boolean;
  isDesktop: boolean;
  isMobile: boolean;
}) {
  const router =
    useRouter();

  const heroRef =
    useRef<HTMLDivElement>(null);

  const {
    scrollYProgress,
  } = useScroll({
    target: heroRef,
    offset: [
      "start start",
      "end start",
    ],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduce ? 0 : 90]
  );

  const opacity =
    useTransform(
      scrollYProgress,
      [0, 0.85],
      [1, reduce ? 1 : 0]
    );

  return (
    <section
      className="xpnd-hero"
      ref={heroRef}
      id="top"
    >
      <div className="xpnd-hero-canvas">
        <Scene
          reduce={reduce}
          offsetX={
            isDesktop
              ? 1.25
              : 0
          }
          isMobile={isMobile}
        />
      </div>

      <div
        className="xpnd-hero-scrim"
        aria-hidden="true"
      />

      <div className="xpnd-container">
        <motion.div
          className="xpnd-hero-content"
          style={{
            y,
            opacity,
          }}
        >
          <Reveal y={18}>
            <span className="xpnd-eyebrow">
              <span className="xpnd-dot" />
              AI-powered expense tracking
            </span>
          </Reveal>

          <Reveal
            delay={0.08}
            y={30}
          >
            <h1
              className="xpnd-h1"
              style={{
                marginTop: 22,
              }}
            >
              Track spending
              <br />
              <span className="grad-text">
                without the hassle.
              </span>
            </h1>
          </Reveal>

          <Reveal
            delay={0.16}
            y={26}
          >
            <p
              className="xpnd-body"
              style={{
                marginTop: 20,
                marginInline:
                  "auto",
              }}
            >
              Xpnd AI makes expense
              tracking simple. Enter
              expenses naturally, and
              the system automatically
              identifies important
              expense details and
              categories.
            </p>
          </Reveal>

          <Reveal
            delay={0.24}
            y={22}
          >
            <div className="xpnd-hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  router.push(
                    "/auth/sign-up"
                  )
                }
              >
                Get Started
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  router.push(
                    "/auth/login"
                  )
                }
              >
                Log In
              </button>
            </div>
          </Reveal>

          <Reveal
            delay={0.32}
            y={18}
          >
            <div className="xpnd-hero-meta">
              <span>
                Natural-language input
              </span>

              <span>
                <i aria-hidden="true" />
                Automated categorization
              </span>

              <span>
                <i aria-hidden="true" />
                Budget monitoring
              </span>
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    title:
      "Natural-language expense input",

    body:
      'Record expenses naturally, such as "Spent 150 pesos for lunch," without filling out multiple fields manually.',

    icon: (
      <svg {...iconProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4.5h0A2.5 2.5 0 0 1 4 13.5z" />
      </svg>
    ),
  },

  {
    title:
      "Automatic categorization",

    body:
      "Xpnd AI processes your expense text and identifies important details such as the amount, category, date, and description.",

    icon: (
      <svg {...iconProps}>
        <path d="M12 2.6 L13.9 9.4 L20.8 11.3 L13.9 13.2 L12 20 L10.1 13.2 L3.2 11.3 L10.1 9.4 Z" />
      </svg>
    ),
  },

  {
    title:
      "Budget and spending monitoring",

    body:
      "Monitor your expenses against your budgets and receive notifications when spending reaches important limits.",

    icon: (
      <svg {...iconProps}>
        <path d="M4 19V5" />
        <path d="M4 16h5v3H4z" />
        <path d="M9 12h5v7H9z" />
        <path d="M14 8h6v11h-6z" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section
      className="xpnd-section"
      id="features"
    >
      <div className="xpnd-container">
        <SectionHead
          eyebrow="Core features"
          title={
            <>
              Expense tracking
              <br />
              <span className="grad-text">
                made simpler.
              </span>
            </>
          }
          sub="Xpnd AI focuses on reducing the effort required to record expenses while helping users understand and monitor their spending."
        />

        <div className="xpnd-grid-3">
          {FEATURES.map(
            (f, i) => (
              <Reveal
                key={f.title}
                delay={i * 0.09}
                style={{
                  display:
                    "flex",
                }}
              >
                <SpotlightCard
                  className="xpnd-card"
                  style={{
                    flex: 1,
                  }}
                >
                  <div className="xpnd-card-icon">
                    {f.icon}
                  </div>

                  <h3 className="xpnd-h3">
                    {f.title}
                  </h3>

                  <p>
                    {f.body}
                  </p>
                </SpotlightCard>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard preview                                                   */
/* ------------------------------------------------------------------ */

const LEDGER_ROWS = [
  {
    label: "Food & Dining",
    value: "₱1,240",
    pct: 82,
    color: C.blue,
  },

  {
    label: "Transportation",
    value: "₱860",
    pct: 57,
    color: C.purple,
  },

  {
    label: "Shopping",
    value: "₱420",
    pct: 28,
    color: C.violet,
  },

  {
    label: "Education",
    value: "₱610",
    pct: 41,
    color: C.lime,
  },
];

function Ledger() {
  const reduce =
    !!useReducedMotion();

  return (
    <section
      className="xpnd-section"
      id="intelligence"
      style={{
        paddingTop: 0,
      }}
    >
      <div className="xpnd-container">
        <SectionHead
          eyebrow="Dashboard preview"
          title={
            <>
              Your spending,
              <br />
              <span className="grad-text">
                in one view.
              </span>
            </>
          }
          sub="View expenses, category breakdowns, budgets, and savings progress from a single dashboard."
        />

        <Reveal y={34}>
          <div className="glass xpnd-ledger">
            <div className="xpnd-ledger-main">
              <div className="xpnd-ledger-top">
                <div>
                  <div
                    style={{
                      fontSize: 12.5,
                      letterSpacing:
                        "0.1em",
                      textTransform:
                        "uppercase",
                      color:
                        "rgba(245,247,255,0.4)",
                      fontWeight: 500,
                    }}
                  >
                    This Month
                  </div>

                  <div
                    className="xpnd-ledger-total"
                    style={{
                      marginTop: 10,
                    }}
                  >
                    ₱4,250

                    <span
                      style={{
                        fontSize:
                          "0.42em",
                        fontWeight: 500,
                        color:
                          "rgba(245,247,255,0.35)",
                        letterSpacing:
                          "-0.01em",
                        marginLeft: 10,
                      }}
                    >
                      spent
                    </span>
                  </div>
                </div>

                <span className="xpnd-chip">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 15 L12 8 L19 15"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Within budget
                </span>
              </div>

              <svg
                className="xpnd-spark"
                viewBox="0 0 420 120"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="xpndLine"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        C.blue
                      }
                    />

                    <stop
                      offset="55%"
                      stopColor={
                        C.purple
                      }
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        C.lime
                      }
                    />
                  </linearGradient>

                  <linearGradient
                    id="xpndFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        C.purple
                      }
                      stopOpacity="0.3"
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        C.purple
                      }
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <motion.path
                  d="M0,92 C42,72 62,98 104,74 C146,50 168,84 210,60 C252,36 280,66 322,42 C360,20 388,32 420,22 L420,120 L0,120 Z"
                  fill="url(#xpndFill)"
                  initial={{
                    opacity: 0,
                  }}
                  whileInView={{
                    opacity: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.35,
                    ease: EASE,
                  }}
                />

                <motion.path
                  d="M0,92 C42,72 62,98 104,74 C146,50 168,84 210,60 C252,36 280,66 322,42 C360,20 388,32 420,22"
                  fill="none"
                  stroke="url(#xpndLine)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{
                    pathLength:
                      reduce
                        ? 1
                        : 0,
                  }}
                  whileInView={{
                    pathLength: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration:
                      reduce
                        ? 0
                        : 1.6,
                    ease: EASE,
                  }}
                />
              </svg>

              <div className="xpnd-rows">
                {LEDGER_ROWS.map(
                  (row, i) => (
                    <div
                      key={
                        row.label
                      }
                    >
                      <div className="xpnd-row-head">
                        <span className="xpnd-row-label">
                          {row.label}
                        </span>

                        <span className="xpnd-row-value">
                          {row.value}
                        </span>
                      </div>

                      <div className="xpnd-bar-track">
                        <motion.div
                          className="xpnd-bar-fill"
                          style={{
                            background:
                              `linear-gradient(90deg, ${row.color}, ${row.color}CC)`,
                            color:
                              row.color,
                          }}
                          initial={{
                            width:
                              reduce
                                ? `${row.pct}%`
                                : 0,
                          }}
                          whileInView={{
                            width: `${row.pct}%`,
                          }}
                          viewport={{
                            once: true,
                            margin:
                              "-40px",
                          }}
                          transition={{
                            duration:
                              reduce
                                ? 0
                                : 1.1,
                            delay:
                              reduce
                                ? 0
                                : 0.15 +
                                  i *
                                    0.08,
                            ease: EASE,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="xpnd-ledger-side">
              <span
                className="xpnd-eyebrow"
                style={{
                  height: 28,
                  fontSize: 12,
                }}
              >
                <span className="xpnd-dot" />
                Spending summary
              </span>

              <p
                style={{
                  margin:
                    "20px 0 0",
                  fontSize:
                    14.5,
                  lineHeight:
                    1.68,
                  color:
                    "rgba(245,247,255,0.66)",
                }}
              >
                Food & Dining is
                currently the
                highest spending
                category. Reviewing
                category totals can
                help you identify
                where your money
                goes.
              </p>

              <div className="xpnd-ai-note">
                <strong>
                  Reminder:
                </strong>{" "}
                Keep recording your
                daily expenses to
                maintain an accurate
                view of your spending.
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 12,
                }}
              >
                {[
                  [
                    "Expenses recorded",
                    "24",
                  ],
                  [
                    "Top category",
                    "Food & Dining",
                  ],
                  [
                    "Budget status",
                    "Within budget",
                  ],
                ].map(
                  ([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: 12,
                        fontSize: 13,
                        color:
                          "rgba(245,247,255,0.42)",
                      }}
                    >
                      <span>
                        {k}
                      </span>

                      <span
                        style={{
                          color:
                            "rgba(245,247,255,0.88)",
                          fontWeight:
                            500,
                          fontVariantNumeric:
                            "tabular-nums",
                          textAlign:
                            "right",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    num: "01",
    title: "Enter an expense",
    body:
      'Type your expense naturally, such as "Spent 150 pesos for lunch."',
  },

  {
    num: "02",
    title: "Let AI process it",
    body:
      "Xpnd AI identifies important expense details and automatically assigns an appropriate category.",
  },

  {
    num: "03",
    title: "Monitor your spending",
    body:
      "View your expenses, budgets, savings, and spending summaries to better understand where your money goes.",
  },
];

function Steps() {
  return (
    <section
      className="xpnd-section"
      id="how"
    >
      <div className="xpnd-container">
        <SectionHead
          eyebrow="How it works"
          title={
            <>
              Three steps.
              <br />
              <span className="grad-text">
                Simple expense tracking.
              </span>
            </>
          }
          sub="Xpnd AI reduces the effort required to record and monitor personal expenses."
        />

        <div className="xpnd-steps">
          {STEPS.map(
            (s, i) => (
              <Reveal
                key={s.num}
                delay={i * 0.1}
              >
                <div className="xpnd-step">
                  <span className="xpnd-step-num">
                    {s.num}
                  </span>

                  <h3 className="xpnd-h3">
                    {s.title}
                  </h3>

                  <p>
                    {s.body}
                  </p>
                </div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Research stats                                                      */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    value: "42",
    label:
      "Student respondents",
  },

  {
    value: "73.8%",
    label:
      "Use mental expense tracking",
  },

  {
    value: "71.4%",
    label:
      "Cited forgetfulness as a challenge",
  },

  {
    value: "40.5%",
    label:
      "Very likely to use automated tracking",
  },
];

function Stats() {
  return (
    <section
      className="xpnd-section"
      style={{
        paddingTop: 0,
      }}
    >
      <div className="xpnd-container">
        <Reveal y={30}>
          <div className="xpnd-stats">
            {STATS.map(
              (s) => (
                <div
                  className="xpnd-stat"
                  key={s.label}
                >
                  <div className="xpnd-stat-num grad-text">
                    {s.value}
                  </div>

                  <div className="xpnd-stat-label">
                    {s.label}
                  </div>
                </div>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const router =
    useRouter();

  return (
    <section
      className="xpnd-section"
      style={{
        paddingTop: 0,
      }}
    >
      <div className="xpnd-container">
        <Reveal y={34}>
          <div className="glass xpnd-cta">
            <div
              className="xpnd-cta-glow"
              aria-hidden="true"
            />

            <div className="xpnd-cta-inner">
              <span className="xpnd-eyebrow">
                <span className="xpnd-dot" />
                Start tracking smarter
              </span>

              <h2
                className="xpnd-h2"
                style={{
                  marginTop: 20,
                  maxWidth: "18ch",
                }}
              >
                Take control of
                your spending.
              </h2>

              <p
                className="xpnd-sub"
                style={{
                  margin:
                    "16px auto 0",
                  textAlign:
                    "center",
                }}
              >
                Record expenses naturally,
                monitor your budget, and
                understand your spending
                habits with Xpnd AI.
              </p>

              <div className="xpnd-cta-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    router.push(
                      "/auth/sign-up"
                    )
                  }
                >
                  Get Started
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    router.push(
                      "/auth/login"
                    )
                  }
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="xpnd-footer">
      <div className="xpnd-container xpnd-footer-inner">
        <a
          className="xpnd-logo"
          href="#top"
          aria-label="Xpnd AI home"
        >
         <div className="flex justify-center pt-[5%]">
            <img
              src="/xpnd-ai-logo-dark.svg"
              alt="Xpnd AI"
              className="h-auto w-[70px] md:w-[90px]"
            />
          </div>
        </a>

        <nav
          className="xpnd-footer-links"
          aria-label="Footer"
        >
          <a href="#features">
            Features
          </a>

          <a href="#how">
            How it works
          </a>

          <a href="#intelligence">
            Dashboard
          </a>

          <a href="#top">
            Privacy
          </a>

          <a href="#top">
            Terms
          </a>
        </nav>

        <span className="xpnd-copy">
          © 2026 Xpnd AI. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function XpndAILanding() {
  const reduce =
    !!useReducedMotion();

  const isDesktop =
    useMediaQuery(
      "(min-width: 900px)"
    );

  const isMobile =
    useMediaQuery(
      "(max-width: 640px)"
    );

  return (
    <div className="xpnd">
      <style>
        {STYLES}
      </style>

      <GradientDefs />

      {/* Ambient backdrop */}
      <div
        className="xpnd-aurora-wrap"
        aria-hidden="true"
      >
        <div className="xpnd-aurora a1" />
        <div className="xpnd-aurora a2" />
        <div className="xpnd-aurora a3" />
      </div>

      <div
        className="xpnd-grid"
        aria-hidden="true"
      />

      <div
        className="xpnd-noise"
        aria-hidden="true"
      />

      <Nav />

      <main className="xpnd-main">
        <Hero
          reduce={reduce}
          isDesktop={isDesktop}
          isMobile={isMobile}
        />

        <Features />

        <Ledger />

        <div className="xpnd-container">
          <div className="xpnd-rule" />
        </div>

        <Steps />

        <Stats />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}