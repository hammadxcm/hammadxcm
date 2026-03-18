import { motion, type Variants } from 'framer-motion';
import React, { type ReactNode } from 'react';
import { useInViewReveal } from './hooks/useInViewReveal';
import { useReducedMotion } from './hooks/useReducedMotion';

type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'blur';

interface Props {
  variant?: RevealVariant;
  stagger?: boolean;
  staggerDelay?: number;
  className?: string;
  children: ReactNode;
}

const springDefault = { type: 'spring' as const, damping: 25, stiffness: 120 };
const springScale = { type: 'spring' as const, damping: 22, stiffness: 100 };

const hiddenStates: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 0, y: 40 },
  left: { opacity: 0, x: -60 },
  right: { opacity: 0, x: 60 },
  scale: { opacity: 0, scale: 0.85 },
  blur: { opacity: 0, filter: 'blur(10px)', y: 20 },
};

const visibleStates: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  blur: { opacity: 1, filter: 'blur(0px)', y: 0 },
};

const springs: Record<RevealVariant, typeof springDefault> = {
  up: springDefault,
  left: springDefault,
  right: springDefault,
  scale: springScale,
  blur: springScale,
};

function buildVariants(
  variant: RevealVariant,
  stagger: boolean,
  staggerDelay: number,
  reduced: boolean,
): { container: Variants; item: Variants } {
  const instant = { duration: 0 };
  const transition = reduced ? instant : springs[variant];

  const container: Variants = {
    hidden: {},
    visible: {
      transition: stagger ? { staggerChildren: staggerDelay, ...transition } : transition,
    },
  };

  const item: Variants = {
    hidden: reduced ? { opacity: 0 } : hiddenStates[variant],
    visible: {
      ...visibleStates[variant],
      transition,
    },
  };

  return { container, item };
}

export function ScrollReveal({
  variant = 'up',
  stagger = false,
  staggerDelay = 0.08,
  className,
  children,
}: Props) {
  const { ref, isInView } = useInViewReveal();
  const reduced = useReducedMotion();
  const { container, item } = buildVariants(variant, stagger, staggerDelay, reduced);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {stagger ? (
        React.Children.map(children, (child) => <motion.div variants={item}>{child}</motion.div>)
      ) : (
        <motion.div variants={item}>{children}</motion.div>
      )}
    </motion.div>
  );
}
