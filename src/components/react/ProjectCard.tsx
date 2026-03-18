import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';
import { type ReactNode, useRef } from 'react';
import { useReducedMotion } from './hooks/useReducedMotion';

interface Props {
  className?: string;
  children: ReactNode;
}

export function ProjectCard({ className, children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, (v) => {
    const el = cardRef.current;
    if (!el) return 0;
    const h = el.getBoundingClientRect().height;
    return (v / h - 0.5) * -10; // maps [0, height] to [5, -5]
  });

  const rotateY = useTransform(mouseX, (v) => {
    const el = cardRef.current;
    if (!el) return 0;
    const w = el.getBoundingClientRect().width;
    return (v / w - 0.5) * 10; // maps [0, width] to [-5, 5]
  });

  const glowBackground = useMotionTemplate`radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(var(--accent-glow), 0.15), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    animate(mouseX, 0, { type: 'spring', damping: 25, stiffness: 120 });
    animate(mouseY, 0, { type: 'spring', damping: 25, stiffness: 120 });
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={cardRef}
        className={className}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <motion.div
          style={{
            background: glowBackground,
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </div>
  );
}
