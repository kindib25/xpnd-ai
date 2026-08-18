"use client";

import React, { useState } from "react";
import ChromaKeyVideo from "../../components/ChromaKeyVideo";
import DashboardBackground from "@/components/dashboard-background";
import { useRouter } from "next/navigation";

const LandingPage: React.FC = () => {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const router = useRouter();

  const handleVideoEnded = () => {
    setIsVideoFinished(true);

    // Reveal everything after the video freezes
    setTimeout(() => {
      setIsTextVisible(true);
    }, 200);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-san text-black p-3 md:p-0">
      {/* BACKGROUND */}
      <DashboardBackground />

      {/* GIANT XPND AI TEXT */}
      <div
        className={`absolute inset-x-0 top-[10%] md:top-[-15%] z-0 flex justify-center pointer-events-none
          transition-all duration-1000 ease-out
          ${isTextVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
          }`}
      >
        <img
          src="/xpnd-ai-logo-dark.svg"
          alt="Xpnd AI"
          className="w-[85vw] md:w-[70vw] lg:w-[75vw] max-w-[1200px] h-auto select-none"
        />
      </div>

      {/* VIDEO */}
      <ChromaKeyVideo
        src="/animated_elements.mp4"
        onEnded={handleVideoEnded}
        className="
          absolute
          left-1/2
          top-[34%]
          -translate-x-1/2
          -translate-y-1/2
          w-[150vw]
          h-[100vh]

          md:inset-0
          md:translate-x-0
          md:translate-y-0
          md:m-auto
          md:w-[92%]
          md:h-[92%]

          z-10
        "
        objectFit="contain"
        keyColor={[4, 85, 179]}
        tolerance={0.1}
        frozen={isVideoFinished}
      />

      {/* RIGHT SIDE NAVIGATION DOTS */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30 hidden md:flex">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border border-black/40 transition-colors duration-300 ${i === 3
              ? "bg-black border-black"
              : "bg-transparent"
              }`}
          />
        ))}
      </div>

      {/* BOTTOM CONTENT */}
      <div className="relative z-20 flex flex-col justify-end items-center min-h-screen pb-60 md:pb-16 px-6 md:px-10">
        <div className="w-full max-w-7xl">
          <div
            className={`flex flex-col lg:flex-row justify-between items-end gap-8 w-full transition-all duration-1000 ease-out ${isTextVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
              }`}
          >
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-1 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-[2px] h-4 bg-white" />

                <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white">
                  AI Expense Tracker
                </p>
              </div>

              <p className="text-white/70 text-[10px] md:text-sm leading-relaxed mt-2">
                Xpnd AI transforms the way you track your expenses.
                Simply describe what you spent in your own words,
                and let intelligent technology organize, categorize,
                and turn every transaction into clear financial insights.
                Built for smarter spending, better awareness, and effortless financial control.

              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <button className="px-10 py-4 border border-primary rounded-full text-[10px] md:text-xs font-bold tracking-wider text-primary hover:bg-primary hover:text-black transition-colors duration-300" onClick={() => router.push("/auth/login")}>
                LOGIN
              </button>
              <button className="px-10 py-4 bg-primary text-black rounded-full text-[10px] md:text-xs font-bold tracking-wider hover:bg-primary/90 transition-colors duration-300" onClick={() => router.push("/auth/sign-up")}>
                SIGNUP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;