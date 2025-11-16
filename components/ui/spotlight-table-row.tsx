"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const SpotlightTableRow = ({
  children,
  className = "",
  spotlightColor,
  onClick,
  ...props
}: {
  children: any;
  className?: string;
  spotlightColor?: string;
  onClick?: () => void;
} & React.ComponentProps<"tr">) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    const timeoutId = setTimeout(checkTheme, 100);
    
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
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

  const defaultLightColor = "rgba(99, 0, 255, 0.12)";
  const defaultDarkColor = "rgba(99, 0, 255, 0.25)";

  const handleMouseMove = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (!rowRef.current || isFocused) return;
    const rect = rowRef.current.getBoundingClientRect();
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

  const getAdjustedColor = () => {
    if (!spotlightColor) {
      return isDark ? defaultDarkColor : defaultLightColor;
    }
    
    const match = spotlightColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = match[1];
      const g = match[2];
      const b = match[3];
      const alpha = isDark ? 0.25 : 0.15;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return spotlightColor;
  };

  const currentColor = getAdjustedColor();

  return (
    <tr
      ref={rowRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn("relative cursor-pointer", className)}
      style={{
        background: opacity > 0
          ? `radial-gradient(circle at ${position.x}px ${position.y}px, ${currentColor}, transparent 80%)`
          : "transparent",
        backgroundClip: "padding-box",
        transition: "background 0.3s ease-in-out",
      }}
      {...props}
    >
      {children}
    </tr>
  );
};

