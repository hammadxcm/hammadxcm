import { motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';
import { useReducedMotion } from './hooks/useReducedMotion';

interface Props {
  children: ReactNode;
  className?: string;
}

export function FloatingTechIcon({ children, className }: Props) {
  const reduced = useReducedMotion();
  const [initialDelay] = useState(() => Math.random() * 2);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: -4 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 10,
        repeat: Infinity,
        repeatType: 'reverse',
        delay: initialDelay,
      }}
      whileHover={{
        scale: 1.15,
        transition: { type: 'spring', stiffness: 300, damping: 15 },
      }}
    >
      {children}
    </motion.div>
  );
}
