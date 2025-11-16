"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const SpotlightCard = ({
  children,
  className = "",
  spotlightColor,
  onClick,
}: {
  children: any;
  className?: string;
  spotlightColor?: string;
  onClick?: () => void;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme - use a small delay to ensure DOM is ready
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    // Check immediately
    checkTheme();
    
    // Also check after a small delay to catch any late theme application
    const timeoutId = setTimeout(checkTheme, 100);
    
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    // Also listen to storage events for theme changes
    const handleStorageChange = () => {
      checkTheme();
    };
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Default spotlight colors for light and dark mode
  const defaultLightColor = "rgba(99, 0, 255, 0.12)"; // Subtle purple glow for light mode
  const defaultDarkColor = "rgba(99, 0, 255, 0.25)"; // More visible purple glow for dark mode

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  // Adjust color opacity based on theme if a color is provided
  const getAdjustedColor = () => {
    if (!spotlightColor) {
      return isDark ? defaultDarkColor : defaultLightColor;
    }
    
    // If color is provided, adjust opacity based on theme
    // Extract RGB values and adjust alpha
    const match = spotlightColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = match[1];
      const g = match[2];
      const b = match[3];
      const alpha = isDark ? 0.25 : 0.15; // More visible in dark mode
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Fallback if parsing fails
    return spotlightColor;
  };

  const currentColor = getAdjustedColor();

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${currentColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

