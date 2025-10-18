"use client";
import { cn } from "@/lib/utils";
import { motion, MotionValue } from "motion/react";
import React from "react";

const transition = {
  duration: 0,
  ease: "linear",
};

export const GoogleGeminiEffect = ({
  pathLengths,
  title,
  description,
  className,
}: {
  pathLengths: MotionValue<number>[];
  title?: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div className={cn("sticky top-80", className)}>
      <p className="text-lg md:text-7xl font-normal pb-4 text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-300">
        {title || "Build with Aceternity UI"}
      </p>
      <p className="text-xs md:text-xl font-normal text-center text-neutral-400 mt-4 max-w-lg mx-auto">
        {description || "Scroll this component and see the bottom SVG come to life!"}
      </p>

      <svg width="1440" height="890" className="absolute -top-60 md:-top-40 w-full">
        {/* Add motion paths here, e.g., pathLengths[0]..pathLengths[4] */}
        <motion.path
          d="M0 663C145.5 663 191 666.265 269 647..."
          stroke="#FFB7C5"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          style={{ pathLength: pathLengths[0] }}
          transition={transition}
        />
        {/* Repeat for other paths */}
      </svg>
    </div>
  );
};
