"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type HeroConfig = {
  fontSize?: "sm" | "md" | "lg" | "xl";
  alignment?: "left" | "center" | "right";
  position?: "top" | "middle" | "bottom";
};

type HeroData = {
  heading: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  config?: HeroConfig;
} | null;

export function HeroSection({ data }: { data: HeroData }) {
  const heading = data?.heading || "Find Solutions\nKeep Machines Running";
  const description = data?.description || "Error codes, troubleshooting, and more for arcade technicians.";
  
  const images = data?.imageUrls && data.imageUrls.length > 0 
    ? data.imageUrls 
    : [data?.imageUrl || "/images/arcade-hero.jpg"];
  
  const config: HeroConfig = data?.config || {};
  const fontSize = config.fontSize || "md";
  const alignment = config.alignment || "left";
  const position = config.position || "bottom";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const headingLines = heading.split("\n");

  // 🌟 ၁၀ စက္ကန့်တစ်ခါ Auto ပြောင်းမယ်
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  // 🌟 Mouse Move ကို ဖမ်းပြီး Parallax Effect လုပ်မယ်
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (images.length <= 1) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentIndex((prev) => (prev + 1) % images.length);
      else setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const headingClass = 
    fontSize === "sm" ? "text-2xl sm:text-3xl" :
    fontSize === "lg" ? "text-4xl sm:text-5xl" :
    fontSize === "xl" ? "text-5xl sm:text-6xl" :
    "text-3xl sm:text-4xl";

  const descClass = fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";
  const positionClass = position === "top" ? "justify-start pt-10" : position === "middle" ? "justify-center" : "justify-end pb-14";
  const alignmentClass = alignment === "center" ? "items-center text-center" : alignment === "right" ? "items-end text-right" : "items-start text-left";

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[440px] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
    >
      {/* 🌟 3D Background Layers */}
      <div className="absolute inset-0 bg-[var(--nx-bg-base-deep)]">
        
        {/* Images with 3D Parallax */}
        {images.map((url, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? "opacity-100" : "opacity-0"}`}
            style={{
              transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0) scale(1.08)`,
              transition: "opacity 1s, transform 0.3s ease-out",
            }}
          >
            <Image
              src={url}
              alt={`Arcade machines ${idx + 1}`}
              fill
              className="object-cover object-center"
              priority={idx === 0}
            />
          </div>
        ))}
        
        {/* 🌟 Cyber Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(32, 227, 255, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(32, 227, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
          }}
        ></div>

        {/* 🌟 Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--nx-bg-base-deep)] via-[var(--nx-bg-base-deep)]/70 to-transparent"></div>
        
        {/* 🌟 Glowing Blue Orb (Bottom Left) */}
        <div 
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#176BFF] blur-[100px] opacity-50 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * -30}px, 0)`,
            transition: "transform 0.3s ease-out",
          }}
        ></div>

        {/* 🌟 Glowing Cyan Orb (Top Right) */}
        <div 
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#20E3FF] blur-[120px] opacity-40 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * 40}px, 0)`,
            transition: "transform 0.3s ease-out",
          }}
        ></div>

        {/* 🌟 Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#20E3FF] rounded-full opacity-70"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                boxShadow: "0 0 10px rgba(32, 227, 255, 0.8)",
                animation: `float-particle ${3 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Counter Badge removed */}

      {/* 🌟 Bottom Content with 3D Depth */}
      <div 
        className={`absolute inset-0 p-6 flex flex-col gap-3 z-20 ${positionClass} ${alignmentClass}`}
        style={{
          transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -10}px, 30px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Tech Label */}
        <div className={`flex items-center gap-2 mb-1 ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : ""}`}>
          <span className="w-8 h-px bg-[#20E3FF]"></span>
          <span className="text-[10px] font-bold text-[#20E3FF] uppercase tracking-[0.3em]">Arcade Diagnostics</span>
        </div>

        {/* Heading with Glow */}
        <h1 
          className={`${headingClass} font-black text-white leading-[1.05] tracking-tight`} 
          style={{ textShadow: "0 0 30px rgba(23, 107, 255, 0.6)" }}
        >
          {headingLines.map((line, idx) => (
            <span key={idx} className="block">{line}</span>
          ))}
        </h1>
        
        {/* Description */}
        <p className={`${descClass} text-[var(--nx-text-secondary-updated)] max-w-[280px] leading-relaxed`}>
          {description}
        </p>

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className={`flex gap-1.5 mt-2 ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : ""}`}>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? "w-8 bg-gradient-to-r from-[#176BFF] to-[#20E3FF]" 
                    : "w-1.5 bg-white/40"
                }`}
                style={idx === currentIndex ? { boxShadow: "0 0 10px rgba(32, 227, 255, 0.8)" } : {}}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Corner Accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#20E3FF]/60 pointer-events-none z-20"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#20E3FF]/60 pointer-events-none z-20"></div>

      {/* 🌟 Custom Animation */}
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-25px) scale(1.8); 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
