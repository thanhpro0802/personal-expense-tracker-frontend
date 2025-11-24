import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import React from "react";

export const AuroraBackground = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900", className)}>
      {/* Aurora effect layers */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* First aurora layer */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 blur-3xl"
          />
          
          {/* Second aurora layer */}
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 blur-3xl"
          />
          
          {/* Third aurora layer */}
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-500/25 via-fuchsia-500/25 to-pink-500/25 blur-3xl"
          />
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
