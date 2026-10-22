"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronRight, BookOpen } from "lucide-react";

type HeroConfig = {
  align?: "left" | "center" | "right";
  alignment?: "left" | "center" | "right";
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  verticalPos?: "top" | "middle" | "bottom";
  position?: "top" | "middle" | "bottom";
  textColor?: string;
};

type HeroData = {
  heading: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  config?: HeroConfig;
  showArcadeLabel?: boolean;
  showHeroText?: boolean;
} | null;

const DEFAULT_HERO: Exclude<HeroData, null> = {
  heading: "Find Solutions.\nKeep Machines Running.",
  description: "Explore error codes, repair guides, machine manuals, and video tutorials.",
  imageUrl: "",
  imageUrls: [],
  config: { fontSize: "md", alignment: "left", position: "bottom" },
  showArcadeLabel: true,
  showHeroText: true,
};

// Font Size ကို ကန့်သတ်ထားမယ် (အလွန်ကြီးလွန်းတာကို ရှောင်ဖို့)
function getFontSize(size?: string) {
  switch (size) {
    case "xs": return "text-base md:text-lg";
    case "sm": return "text-lg md:text-xl";
    case "md": return "text-xl md:text-2xl";
    case "lg": return "text-2xl md:text-3xl";
    case "xl": return "text-2xl md:text-3xl"; // Max 3xl (အကြီးဆုံး)
    case "2xl": return "text-2xl md:text-3xl"; // Max 3xl
    default: return "text-xl md:text-2xl";
  }
}

function getAlignment(align?: string) {
  if (align === "center") return "items-center text-center";
  if (align === "right") return "items-end text-right";
  return "items-start text-left";
}

function getVerticalPos(pos?: string) {
  switch (pos) {
    case "top": return "justify-start pt-4";
    case "middle": return "justify-center";
    case "bottom": return "justify-end pb-4";
    default: return "justify-center";
  }
}

export function HeroSection({ data }: { data: HeroData }) {
  const heroData = data || DEFAULT_HERO;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const images = heroData?.imageUrls && heroData.imageUrls.length > 0
    ? heroData.imageUrls
    : heroData?.imageUrl
      ? [heroData.imageUrl]
      : [];

  // ၁၀ စက္ကန့်တစ်ခါ ပြောင်းမယ်
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchEnd(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
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

  const hasImages = images.length > 0;
  
  // စာသားတွေ ပြမလား ဆုံးဖြတ်မယ်
  const showText = heroData?.showHeroText !== false;
  const showLabel = heroData?.showArcadeLabel !== false;
  
  // Config တွေ
  const config = heroData?.config || {};
  const fontSizeClass = getFontSize(config.fontSize);
  const alignClass = getAlignment(config.alignment || config.align);
  const positionClass = getVerticalPos(config.position || config.verticalPos);

  return (
    <div className="px-4 mb-4">
      <div 
        className="relative rounded-2xl overflow-hidden border border-[var(--nx-border-updated)] shadow-xl min-h-[220px] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Images */}
        {hasImages ? (
          <>
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_S3_URL}/${img}`}
                  alt={`Hero ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020]/95 via-[#0B1020]/70 to-transparent"></div>
              </div>
            ))}
            
            {/* Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex 
                        ? "w-6 bg-[var(--nx-cyan)]" 
                        : "w-1.5 bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // ပုံမရှိရင် Gradient ပဲ ပြမယ်
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1020] via-[#101F3D] to-[#0A1E4A]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--nx-cyan)] opacity-20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--nx-accent)] opacity-10 rounded-full blur-2xl -ml-12 -mb-12"></div>
          </div>
        )}

        {/* Text Content (Show/Hide Toggle ပါ) */}
        {showText && (
          <div className={`relative z-10 p-5 flex-1 flex flex-col ${alignClass} ${positionClass}`}>
            {showLabel && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--nx-cyan)] bg-[var(--nx-cyan)]/10 rounded-md w-fit border border-[var(--nx-cyan)]/30 backdrop-blur-sm">
                <BookOpen size={10} /> TECHNICAL KNOWLEDGE
              </span>
            )}
            
            <h2 className={`font-extrabold text-white leading-tight mt-2 drop-shadow-lg whitespace-pre-line ${fontSizeClass}`}>
              {heroData.heading}
            </h2>
            
            <p className="text-xs md:text-sm text-gray-200 leading-relaxed max-w-[95%] mt-1.5 drop-shadow line-clamp-3">
              {heroData.description}
            </p>
            
            <button 
              onClick={() => document.getElementById('article-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-3 w-fit px-4 py-2 bg-[var(--nx-cyan)] text-black text-xs font-bold rounded-lg hover:bg-[#06B6D4] transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/30"
            >
              Explore Library <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
