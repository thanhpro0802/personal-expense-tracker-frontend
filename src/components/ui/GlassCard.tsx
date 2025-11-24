import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const GlassCard = ({ className, children, hoverEffect = true, ...props }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hoverEffect ? { scale: 1.02, y: -5 } : {}}
      className={cn(
        "backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl",
        "hover:bg-white/15 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
