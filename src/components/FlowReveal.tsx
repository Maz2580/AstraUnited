"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type FlowRevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

type PopCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FlowReveal({ children, className = "", id }: FlowRevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 112, scale: 0.92 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ amount: 0.24, once: false }}
      transition={{ type: "spring", stiffness: 118, damping: 18, mass: 0.82 }}
    >
      {children}
    </motion.section>
  );
}

export function PopCard({ children, className = "", delay = 0 }: PopCardProps) {
  const reducedMotion = useReducedMotion();

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    event.currentTarget.setAttribute("data-pointer", "true");
  };

  const clearPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.removeAttribute("data-pointer");
  };

  return (
    <motion.div
      className={`tunnel-card ${className}`.trim()}
      data-flow-item
      onPointerMove={updatePointer}
      onPointerLeave={clearPointer}
      initial={reducedMotion ? false : { opacity: 0, y: 68, scale: 0.86, rotate: -1.25 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1, rotate: 0 }}
      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.01 }}
      viewport={{ amount: 0.35, once: false }}
      transition={{ type: "spring", stiffness: 210, damping: 21, mass: 0.72, delay }}
    >
      {children}
    </motion.div>
  );
}
