"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Phone,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

interface SidebarNewProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onExpandChange?: (expanded: boolean) => void;
}

export function SidebarNew({ currentView, onViewChange, onExpandChange }: SidebarNewProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    onExpandChange?.(open);
  }, [open, onExpandChange]);

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "shortages", label: t("shortages"), icon: AlertTriangle },
    { id: "calls", label: t("callsNav"), icon: Phone },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="flex flex-col h-full justify-between gap-0 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-center border-b border-neutral-800 px-0">
            {open ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
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
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-10 w-10"
              >
                <Image 
                  src="/valio-aimo-logo.png"
                  alt="Valio Aimo" 
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </motion.div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="mt-2 flex flex-col gap-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <SidebarLink
                  key={item.id}
                  link={{
                    label: item.label,
                    icon: <Icon className="h-5 w-5 flex-shrink-0" />,
                  }}
                  isActive={isActive}
                  onClick={() => onViewChange(item.id)}
                />
              );
            })}
          </nav>
        </div>

        {/* Footer - Info */}
        <div className="border-t border-neutral-800 pt-2 px-2">
          <SidebarLink
            link={{
              label: t("info"),
              icon: <Info className="h-5 w-5 flex-shrink-0" />,
            }}
            isActive={currentView === "info"}
            onClick={() => onViewChange("info")}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

