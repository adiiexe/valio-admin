"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
}

export function AnimatedIcon({ icon: Icon, className = "", size }: AnimatedIconProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.1,
        rotate: [0, -5, 5, -5, 0],
        filter: [
          "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
          "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))",
        ],
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="inline-block"
    >
      <Icon className={className} size={size} />
    </motion.div>
  );
}

