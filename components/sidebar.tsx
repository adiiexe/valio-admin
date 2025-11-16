"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  Phone,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/use-translations";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onExpandChange?: (expanded: boolean) => void;
}

export function Sidebar({ currentView, onViewChange, onExpandChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const { t } = useTranslations();

  const effectiveExpanded = isExpanded && !isManuallyCollapsed;

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "shortages", label: t("shortages"), icon: AlertTriangle },
    { id: "calls", label: t("callsNav"), icon: Phone },
  ];

  useEffect(() => {
    onExpandChange?.(effectiveExpanded);
  }, [effectiveExpanded, onExpandChange]);

  return (
    <>
      {/* Mobile Overlay */}
      {effectiveExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: effectiveExpanded ? 240 : 80 }}
        transition={{ 
          duration: 0.35, 
          ease: [0.16, 1, 0.3, 1] // Apple-like smooth easing curve
        }}
        className="fixed left-0 top-0 z-50 h-screen border-r border-border/50 bg-sidebar/95 backdrop-blur-sm overflow-hidden dark:border-border dark:bg-sidebar/95"
        onMouseEnter={() => !isManuallyCollapsed && setIsExpanded(true)}
        onMouseLeave={() => !isManuallyCollapsed && setIsExpanded(false)}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand Section */}
          <motion.div 
            layout
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "flex h-16 items-center border-b border-border/50 dark:border-border",
              effectiveExpanded ? "justify-center px-3" : "justify-center px-0"
            )}
          >
            <motion.div
              animate={{
                width: effectiveExpanded ? "100%" : "40px",
                height: effectiveExpanded ? "100%" : "40px",
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden"
            >
              <Image 
                src="/valio-aimo-logo.png"
                alt="Valio Aimo" 
                width={120}
                height={64}
                className="h-full w-full object-contain"
                unoptimized
              />
            </motion.div>
          </motion.div>

          {/* Navigation Menu */}
          <nav className={cn(
            "flex-1 space-y-2",
            effectiveExpanded ? "p-4" : "p-3"
          )}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  layout
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className={cn(
                    "group relative flex w-full items-center rounded-xl py-3",
                    effectiveExpanded ? "gap-3 px-3" : "justify-center px-0",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground dark:hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence mode="popLayout">
                    {effectiveExpanded && (
                      <motion.span
                        key={item.id}
                        initial={{ opacity: 0, x: -8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3,
                          ease: [0.16, 1, 0.3, 1], // Apple-like easing
                          opacity: { duration: 0.25 },
                          x: { duration: 0.3 },
                          scale: { duration: 0.3 }
                        }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator */}
                  {isActive && effectiveExpanded && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    />
                  )}
                  {isActive && !effectiveExpanded && (
                    <motion.div
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-blue-500"
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!effectiveExpanded && (
                    <div className="absolute left-full ml-2 hidden rounded-md bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-lg group-hover:block">
                      {item.label}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={cn(
            "border-t border-border/50 dark:border-border",
            effectiveExpanded ? "p-4" : "p-3"
          )}>
            <motion.button
              onClick={() => onViewChange("info")}
              layout
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "group relative flex w-full items-center rounded-xl py-3",
                effectiveExpanded ? "gap-3 px-3" : "justify-center px-0",
                currentView === "info"
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground dark:hover:bg-muted/50"
              )}
            >
              <Info className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence mode="popLayout">
                {effectiveExpanded && (
                  <motion.span
                    key="info"
                    initial={{ opacity: 0, x: -8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1], // Apple-like easing
                      opacity: { duration: 0.25 },
                      x: { duration: 0.3 },
                      scale: { duration: 0.3 }
                    }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {t("info")}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active Indicator */}
              {currentView === "info" && effectiveExpanded && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                />
              )}
              {currentView === "info" && !effectiveExpanded && (
                <motion.div
                  className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-blue-500"
                />
              )}

              {/* Tooltip for collapsed state */}
              {!effectiveExpanded && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-lg group-hover:block">
                  {t("info")}
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

