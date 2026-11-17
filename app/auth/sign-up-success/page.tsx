"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const STYLES = `
.xpnd-success,
.xpnd-success * {
  box-sizing: border-box;
}

.xpnd-success {
  --off: var(--foreground);
  --blue: #4F7DFF;
  --purple: var(--primary);
  --lime: #B6FF3B;

  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    24px
    max(20px, env(safe-area-inset-left))
    max(84px, 12vh)
    max(20px, env(safe-area-inset-right));
  background: var(--background);
  color: var(--foreground);
  overflow: hidden;
  isolation: isolate;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* ================================================================== */
/* Backdrop                                                           */
/* ================================================================== */

.xpnd-success-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image:
    radial-gradient(ellipse 120% 70% at 50% 50%, #000 5%, transparent 78%);
  mask-image:
    radial-gradient(ellipse 120% 70% at 50% 50%, #000 5%, transparent 78%);
}

.xpnd-success-noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.045;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>");
}

.xpnd-success-aurora {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, opacity;
}

.xpnd-success-aurora.a1 {
  width: 620px;
  height: 620px;
  top: -260px;
  left: -200px;
  background: radial-gradient(circle, color-mix(in srgb, var(--blue) 42%, transparent), transparent 68%);
  filter: blur(100px);
  animation: xpndSuccDrift1 22s ease-in-out infinite alternate;
}

.xpnd-success-aurora.a2 {
  width: 680px;
  height: 680px;
  bottom: -280px;
  right: -220px;
  background: radial-gradient(circle, color-mix(in srgb, var(--primary) 38%, transparent), transparent 68%);
  filter: blur(100px);
  animation: xpndSuccDrift2 26s ease-in-out infinite alternate;
}

.xpnd-success-aurora.a3 {
  width: 420px;
  height: 420px;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, color-mix(in srgb, var(--lime) 14%, transparent), transparent 72%);
  filter: blur(120px);
  animation: xpndSuccDrift3 30s ease-in-out infinite alternate;
}

@keyframes xpndSuccDrift1 {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(60px, 44px, 0) scale(1.1); }
}

@keyframes xpndSuccDrift2 {
  from { transform: translate3d(0, 0, 0) scale(1.05); }
  to { transform: translate3d(-66px, -52px, 0) scale(0.95); }
}

@keyframes xpndSuccDrift3 {
  from { opacity: 0.55; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 0.85; transform: translate(-50%, -50%) scale(1.1); }
}

/* ================================================================== */
/* Content stack                                                      */
/* ================================================================== */

.xpnd-success-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  transform: translateY(-2vh);
}

/* ================================================================== */
/* Brand                                                              */
/* ================================================================== */

.xpnd-success-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.xpnd-success-brand a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px 0;
  border-radius: 999px;
  transition: opacity 0.25s ease;
}

.xpnd-success-brand a:hover {
  opacity: 0.85;
}

.xpnd-success-logo {
  display: block;
  height: 100px;
  width: auto;
  max-width: 170px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.xpnd-success-tagline {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 0.2;
  color: color-mix(in srgb, var(--foreground) 42%, transparent);
}

/* ================================================================== */
/* Glass card                                                          */
/* ================================================================== */

.xpnd-success-card {
  position: relative;
  padding: 36px 28px 32px !important;
  border-radius: 26px !important;
  border: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent) !important;
  background:
    radial-gradient(130% 100% at 100% 0%, color-mix(in srgb, var(--foreground) 11%, transparent), transparent 52%),
    radial-gradient(110% 90% at 0% 100%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 58%),
    radial-gradient(100% 60% at 50% 0%, color-mix(in srgb, var(--primary) 7%, transparent), transparent 62%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--foreground) 7.5%, transparent),
      color-mix(in srgb, var(--foreground) 2.2%, transparent)
    ) !important;
  backdrop-filter: blur(28px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(150%) !important;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 14%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--foreground) 3%, transparent),
    inset 0 0 90px color-mix(in srgb, var(--primary) 5.5%, transparent),
    0 30px 90px -40px rgba(0, 0, 0, 0.35),
    0 8px 30px -14px rgba(0, 0, 0, 0.18) !important;
  color: var(--foreground) !important;
  overflow: hidden;
  isolation: isolate;
}

.xpnd-success-card::before {
  content: "";
  position: absolute;
  inset: -50px;
  border-radius: 60px;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 60%),
    radial-gradient(ellipse at 72% 82%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 62%);
  filter: blur(50px);
  z-index: -1;
}

.xpnd-success-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent, color-mix(in srgb, var(--foreground) 55%, transparent), transparent)
      top center / 60% 1px no-repeat,
    radial-gradient(
      ellipse 55% 35% at 22% 0%,
      color-mix(in srgb, var(--foreground) 9%, transparent),
      transparent 70%
    ),
    linear-gradient(180deg, color-mix(in srgb, var(--foreground) 10%, transparent), transparent 38%);
  opacity: 0.95;
}

.xpnd-success-card > * {
  position: relative;
  z-index: 1;
}

.xpnd-success-card [class*="card-header"] {
  padding: 0 !important;
  border-bottom: none !important;
}

.xpnd-success-card [class*="card-content"] {
  padding: 0 !important;
}

.xpnd-success-card [class*="card-title"] {
  color: var(--foreground) !important;
  font-weight: 600 !important;
  letter-spacing: -0.028em !important;
  font-size: 1.55rem !important;
  line-height: 1.15 !important;
}

/* ================================================================== */
/* Success mark                                                       */
/* ================================================================== */

.xpnd-success-mark-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
  position: relative;
}

.xpnd-success-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background:
    radial-gradient(120% 120% at 30% 0%, color-mix(in srgb, var(--foreground) 28%, transparent), transparent 55%),
    linear-gradient(150deg, var(--blue) 0%, var(--primary) 55%, var(--lime) 100%);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 40%, transparent),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18),
    0 16px 40px -16px color-mix(in srgb, var(--primary) 90%, transparent),
    0 0 0 0 color-mix(in srgb, var(--primary) 35%, transparent);
  animation: xpndSuccPop 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.xpnd-success-mark::before {
  content: "";
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, color-mix(in srgb, var(--primary) 32%, transparent), transparent 70%);
  filter: blur(20px);
  z-index: -1;
}

.xpnd-success-mark svg {
  width: 28px;
  height: 28px;
  color: #060814;
  stroke-width: 2.6;
}

@keyframes xpndSuccPop {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  60% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ================================================================== */
/* Body copy                                                          */
/* ================================================================== */

.xpnd-success-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.xpnd-success-body p {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.62;
  color: color-mix(in srgb, var(--foreground) 62%, transparent);
}

.xpnd-success-body strong {
  color: color-mix(in srgb, var(--foreground) 95%, transparent);
  font-weight: 500;
}

/* ================================================================== */
/* Actions                                                            */
/* ================================================================== */

.xpnd-success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 26px;
}

.xpnd-success-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px !important;
  padding: 0 22px !important;
  border-radius: 999px !important;
  border: 1px solid transparent !important;
  color: var(--primary-foreground) !important;
  font-family: inherit !important;
  font-size: 14.5px !important;
  font-weight: 600 !important;
  letter-spacing: -0.012em !important;
  cursor: pointer;
  white-space: nowrap;
  background-image:
    linear-gradient(100deg,
      var(--primary) 0%,
      color-mix(in srgb, var(--primary) 82%, var(--foreground)) 100%) !important;
  background-size: 200% 100% !important;
  background-position: 0% 50% !important;
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--foreground) 14%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 24%, transparent),
    inset 0 -1px 0 rgba(0, 0, 0, 0.12),
    0 10px 30px -12px color-mix(in srgb, var(--primary) 85%, transparent) !important;
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    background-position 0.7s cubic-bezier(0.22, 1, 0.36, 1) !important;
  will-change: transform;
  width: 100%;
  text-decoration: none;
}

.xpnd-success-primary:hover {
  background-position: 100% 50% !important;
  transform: translateY(-1px);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--foreground) 22%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 30%, transparent),
    inset 0 -1px 0 rgba(0, 0, 0, 0.14),
    0 18px 44px -14px color-mix(in srgb, var(--primary) 95%, transparent),
    0 0 0 6px color-mix(in srgb, var(--primary) 7%, transparent) !important;
}

.xpnd-success-primary:active {
  transform: scale(0.985);
}

.xpnd-success-ghost {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--foreground) 6%, transparent),
      color-mix(in srgb, var(--foreground) 2%, transparent)
    );
  color: color-mix(in srgb, var(--foreground) 86%, transparent);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.012em;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 12%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--foreground) 2%, transparent),
    0 8px 22px -14px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  width: 100%;
}

.xpnd-success-ghost:hover {
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--foreground) 10%, transparent),
      color-mix(in srgb, var(--foreground) 4%, transparent)
    );
  border-color: color-mix(in srgb, var(--foreground) 22%, transparent);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 16%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--foreground) 3%, transparent),
    0 14px 32px -16px rgba(0, 0, 0, 0.45);
}

.xpnd-success-ghost:active {
  transform: scale(0.985);
}

/* ================================================================== */
/* Footer note                                                        */
/* ================================================================== */

.xpnd-success-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid color-mix(in srgb, var(--foreground) 6%, transparent);
  font-size: 12.5px;
  color: color-mix(in srgb, var(--foreground) 42%, transparent);
  text-align: center;
}

.xpnd-success-note a {
  color: color-mix(in srgb, var(--foreground) 82%, transparent);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px dashed color-mix(in srgb, var(--foreground) 22%, transparent);
  padding-bottom: 1px;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.xpnd-success-note a:hover {
  color: var(--foreground);
  border-color: color-mix(in srgb, var(--foreground) 50%, transparent);
}

/* ================================================================== */
/* Reduced motion                                                     */
/* ================================================================== */

@media (prefers-reduced-motion: reduce) {
  .xpnd-success-aurora {
    animation: none !important;
  }

  .xpnd-success-mark {
    animation: none !important;
  }

  .xpnd-success-primary,
  .xpnd-success-ghost {
    transition-duration: 0.01ms !important;
    transform: none !important;
  }

  .xpnd-success-shell {
    transform: none !important;
  }
}
`;

export default function SignUpSuccessPage() {
  return (
    <div className="xpnd-success">
      <style>{STYLES}</style>

      {/* Ambient backdrop */}
      <div className="xpnd-success-aurora a1" aria-hidden="true" />
      <div className="xpnd-success-aurora a2" aria-hidden="true" />
      <div className="xpnd-success-aurora a3" aria-hidden="true" />
      <div className="xpnd-success-grid" aria-hidden="true" />
      <div className="xpnd-success-noise" aria-hidden="true" />

      <div className="xpnd-success-shell">
        {/* Brand */}
        <div className="xpnd-success-brand">
          <Link href="/landing_page" aria-label="Xpnd AI home">
            <img
              src="/xpnd-ai-logo-dark.svg"
              alt="Xpnd AI"
              className="xpnd-success-logo hidden dark:block"
            />
            <img
              src="/xpnd-ai-logo-light.svg"
              alt="Xpnd AI"
              className="xpnd-success-logo block dark:hidden"
            />
          </Link>
        </div>

        {/* Glass card */}
        <Card className="xpnd-success-card">
          <CardHeader>
            <div className="xpnd-success-mark-wrap">
              <div className="xpnd-success-mark" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5 L10 17.5 L19 7" />
                </svg>
              </div>
            </div>

            <CardTitle className="text-center text-2xl">Account created</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="xpnd-success-body">
              <p className="text-center">
                Your account is ready. We&apos;ve sent a confirmation
                link to your inbox.
              </p>
              <p className="text-center">
                <strong>Confirm your email</strong> to activate your
                account, then log in to start tracking.
              </p>
            </div>

            <div className="xpnd-success-actions">
              <Link href="/auth/login" className="xpnd-success-primary">
                Go to Login
              </Link>

              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="xpnd-success-ghost"
              >
                Open Email Inbox
              </a>
            </div>

            <div className="xpnd-success-note">
              Didn&apos;t get the email?{" "}
              <a href="/auth/sign-up">Try again</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}