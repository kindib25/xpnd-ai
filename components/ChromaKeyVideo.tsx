"use client";

import React, { useEffect, useRef } from "react";

type RGB = [number, number, number];

const DEFAULT_KEY_COLOR: RGB = [0, 255, 0]; // green

interface ChromaKeyVideoProps {
  src: string;
  className?: string;
  onEnded?: () => void;
  keyColor?: RGB;
  tolerance?: number; // 0 to 1
  objectFit?: "contain" | "cover";
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  crossOrigin?: "anonymous" | "use-credentials";
  frozen?: boolean; // NEW: when true, freeze on the last drawn frame
}

const ChromaKeyVideo: React.FC<ChromaKeyVideoProps> = ({
  src,
  className = "",
  onEnded,
  keyColor = DEFAULT_KEY_COLOR,
  tolerance = 0.3,
  objectFit = "contain",
  autoPlay = true,
  muted = true,
  loop = false,
  crossOrigin = "anonymous",
  frozen = false, // default false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const keyColorString = keyColor.join(",");

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const [kr, kg, kb] = keyColorString.split(",").map(Number) as RGB;

    const setupCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
      // If frozen, stop the loop and keep the last drawn frame
      if (frozen) {
        cancelAnimationFrame(rafRef.current);
        return;
      }

      if (video.ended && !loop) {
        cancelAnimationFrame(rafRef.current);
        return;
      }

      const parent = canvas.parentElement;
      if (!parent || !video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const rect = parent.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      const dpr = window.devicePixelRatio || 1;

      if (
        canvas.width !== Math.floor(cw * dpr) ||
        canvas.height !== Math.floor(ch * dpr)
      ) {
        setupCanvas();
      }

      ctx.clearRect(0, 0, cw, ch);

      const videoRatio = video.videoWidth / video.videoHeight;
      const canvasRatio = cw / ch;

      let dx = 0;
      let dy = 0;
      let dw = cw;
      let dh = ch;

      if (objectFit === "cover") {
        if (videoRatio > canvasRatio) {
          dh = ch;
          dw = ch * videoRatio;
          dx = (cw - dw) / 2;
        } else {
          dw = cw;
          dh = cw / videoRatio;
          dy = (ch - dh) / 2;
        }
      } else {
        // contain
        if (videoRatio > canvasRatio) {
          dw = cw;
          dh = cw / videoRatio;
          dy = (ch - dh) / 2;
        } else {
          dh = ch;
          dw = ch * videoRatio;
          dx = (cw - dw) / 2;
        }
      }

      ctx.drawImage(video, dx, dy, dw, dh);

      // Chroma key pixel processing
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const distance =
            Math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2) /
            441.67;

          if (distance < tolerance) {
            data[i + 3] = 0;
          } else if (distance < tolerance * 1.5) {
            data[i + 3] = Math.round(
              255 * ((distance - tolerance) / (tolerance * 0.5))
            );
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (error) {
        console.warn(
          "Chroma key processing failed. If the video is cross-origin, ensure CORS headers are set.",
          error
        );
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    const handleLoadedMetadata = () => {
      setupCanvas();
      if (!frozen) drawFrame();
    };

    const handlePlay = () => {
      setupCanvas();
      if (!frozen) drawFrame();
    };

    const handleResize = () => {
      setupCanvas();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    window.addEventListener("resize", handleResize);

    if (autoPlay && !frozen) {
      video.muted = muted;
      video.play().catch((error) => {
        console.warn("Autoplay was prevented:", error);
      });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    src,
    keyColorString,
    tolerance,
    objectFit,
    autoPlay,
    muted,
    loop,
    crossOrigin,
    frozen, // include frozen in dependencies
  ]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        src={src}
        className="hidden"
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        loop={loop}
        crossOrigin={crossOrigin}
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default ChromaKeyVideo;