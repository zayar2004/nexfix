"use client";

import { useEffect, useState, useRef } from "react";

type HeroConfig = {
  align?: "left" | "center";
  fontSize?: "sm" | "md" | "lg" | "xl";
  verticalPos?: "top" | "middle" | "bottom";
};

type HeroData = {
  heading: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  config?: HeroConfig;
} | null;

function getFontSize(size?: string) {
  switch (size) {
    case "sm": return "text-2xl md:text-3xl";
    case "lg": return "text-4xl md:text-5xl";
    case "xl": return "text-5xl md:text-6xl";
    default: return "text-3xl md:text-4xl";
  }
}

function getAlignment(align?: string) {
  return align === "center" ? "items-center text-center" : align === "left" ? "items-start text-left" : "items-start text-left";
}

function getVerticalPos(pos?: string) {
  switch (pos) {
    case "top": return "justify-start pt-10";
    case "bottom": return "justify-end pb-10";
    default: return "justify-center";
  }
}

export function HeroSection({ data }: { data: HeroData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const images = data?.imageUrls && data.imageUrls.length > 0
    ? data.imageUrls
    : data?.imageUrl
      ? [data.imageUrl]
      : [];

  // ✅ useEffect MUST be called before any conditional return
  useEffect(() => {
    if (!data || images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data, images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe && images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe && images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // 🔒 Show Loading Skeleton if data is not ready yet (AFTER useEffect)
  if (!data) {
    return (
      <div className="relative w-full h-[420px] bg-[var(--nx-bg-surface-deep)] overflow-hidden">
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--nx-bg-surface-deep)] via-[var(--nx-bg-card)] to-[var(--nx-bg-surface-deep)]" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 gap-3">
            <div className="h-3 w-24 bg-[var(--nx-border-updated)] rounded" />
            <div className="h-8 w-3/4 bg-[var(--nx-border-updated)] rounded" />
            <div className="h-8 w-1/2 bg-[var(--nx-border-updated)] rounded" />
            <div className="h-3 w-2/3 bg-[var(--nx-border-updated)] rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  const config = data.config || {};
  const fontClass = getFontSize(config.fontSize);
  const alignClass = getAlignment(config.align);
  const vPosClass = getVerticalPos(config.verticalPos);

  return (
    <div
      className="relative w-full h-[420px] overflow-hidden bg-[var(--nx-midnight)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Carousel */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={img}
            alt="Arcade Hero"
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--nx-midnight)]/95 via-[var(--nx-midnight)]/70 to-transparent" />

      {/* Content */}
      <div className={`absolute inset-0 flex flex-col px-6 ${alignClass} ${vPosClass} z-10`}>
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-[2px] bg-[var(--nx-cyan)]" />
            <span className="text-[var(--nx-cyan)] text-xs font-bold tracking-widest">
              ARCADE DIAGNOSTICS
            </span>
          </div>

          <h1 className={`font-black text-white leading-tight mb-3 ${fontClass}`}>
            {data.heading}
          </h1>

          <p className="text-[var(--nx-text-secondary-updated)] text-sm md:text-base mb-6 max-w-md">
            {data.description}
          </p>
        </div>
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "w-6 bg-[var(--nx-cyan)]" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
