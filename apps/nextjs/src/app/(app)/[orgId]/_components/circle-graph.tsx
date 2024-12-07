import React from "react";
import { motion } from "motion/react";

interface CircleGraphProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircleGraph({
  percentage,
  size = 100,
  strokeWidth = 4,
}: CircleGraphProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (percentage * circumference) / 100;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="text-muted/50"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <motion.circle
        className="text-current"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        initial={{
          strokeDasharray: circumference,
          strokeDashoffset: circumference,
        }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
}
