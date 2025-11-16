"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export type ThemeTransitionType = "horizontal" | "vertical"

type AnimatedThemeToggleButtonProps = {
  type: ThemeTransitionType
  className?: string
}

function triggerThemeTransition(type: ThemeTransitionType) {
  if (typeof document === "undefined") return
  
  if (!document.startViewTransition) {
    // Fallback for browsers that don't support View Transitions API
    return
  }

  if (type === "horizontal") {
    document.documentElement.animate(
      {
        clipPath: [
          "inset(50% 0 50% 0)",
          "inset(0 0 0 0)"
        ]
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  } else if (type === "vertical") {
    document.documentElement.animate(
      {
        clipPath: [
          "inset(0 50% 0 50%)",
          "inset(0 0 0 0)"
        ]
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }
}

export const AnimatedThemeToggleButton = ({
  type,
  className
}: AnimatedThemeToggleButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setIsDark(theme === "dark")
  }, [theme])

  const handleToggle = useCallback(async () => {
    if (!buttonRef.current || !mounted) return

    const newTheme = theme === "dark" ? "light" : "dark"
    const isDarkMode = newTheme === "dark"

    // Check if View Transitions API is supported
    if (typeof document !== "undefined" && document.startViewTransition) {
      await document.startViewTransition(() => {
        flushSync(() => {
          setIsDark(isDarkMode)
          setTheme(newTheme)
        })
      }).ready

      triggerThemeTransition(type)
    } else {
      // Fallback for browsers without View Transitions API
      setIsDark(isDarkMode)
      setTheme(newTheme)
    }
  }, [theme, type, setTheme, mounted])

  if (!mounted) {
    return (
      <button
        ref={buttonRef}
        aria-label={`Toggle theme - ${type}`}
        type="button"
        className={cn(
          "flex items-center justify-center p-2 rounded-full outline-none focus:outline-none active:outline-none focus:ring-0 cursor-pointer border transition-colors",
          "bg-background border-border",
          className
        )}
        style={{ width: 44, height: 44 }}
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      aria-label={`Toggle theme - ${type}`}
      type="button"
      className={cn(
        "flex items-center justify-center p-2 rounded-full outline-none focus:outline-none active:outline-none focus:ring-0 cursor-pointer border transition-colors",
        "bg-background border-border hover:bg-muted",
        className
      )}
      style={{ width: 44, height: 44 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
            className="text-yellow-400"
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
            className="text-blue-900 dark:text-blue-400"
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

