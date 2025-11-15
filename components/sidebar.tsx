"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  Phone,
  AlertTriangle,
  Settings,
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
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-50 h-screen border-r border-neutral-800 bg-neutral-900/95 backdrop-blur-sm"
        onMouseEnter={() => !isManuallyCollapsed && setIsExpanded(true)}
        onMouseLeave={() => !isManuallyCollapsed && setIsExpanded(false)}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand Section */}
          <div className="flex h-16 items-center justify-center border-b border-neutral-800 px-3">
            <Image 
              src="/valio-aimo-logo.png"
              alt="Valio Aimo" 
              width={120}
              height={64}
              className="h-full w-full object-contain"
              unoptimized
            />
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all",
                    isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {effectiveExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-500"
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!effectiveExpanded && (
                    <div className="absolute left-full ml-2 hidden rounded-md bg-neutral-800 px-2 py-1 text-xs text-white group-hover:block">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-neutral-800 p-3">
            <button
              onClick={() => onViewChange("settings")}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all",
                currentView === "settings"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
              )}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {effectiveExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-medium"
                >
                  {t("settings")}
                </motion.span>
              )}

              {/* Active Indicator */}
              {currentView === "settings" && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-500"
                />
              )}

              {/* Tooltip for collapsed state */}
              {!effectiveExpanded && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-neutral-800 px-2 py-1 text-xs text-white group-hover:block">
                  {t("settings")}
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

