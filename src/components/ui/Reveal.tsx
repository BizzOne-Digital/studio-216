"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Scroll-triggered fade/slide reveal; respects reduced-motion. */
export function Reveal({ children, className, delay = 0, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const reduce = useReducedMotion();
  const Cmp = motion[as];
  if (reduce) return <Cmp className={className}>{children}</Cmp>;
  return (
    <Cmp className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={item} transition={{ delay }}>
      {children}
    </Cmp>
  );
}

/** Staggers direct children wrapped in <RevealItem>. */
export function Stagger({ children, className, gap = 0.1 }: { children: React.ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
