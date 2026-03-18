import { motion, type Variants } from 'framer-motion';
import { useInViewReveal } from './hooks/useInViewReveal';
import { useReducedMotion } from './hooks/useReducedMotion';

interface Props {
  label: string;
  title: string;
}

const spring = { type: 'spring' as const, damping: 25, stiffness: 120 };

const labelVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: spring },
};

const titleContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring },
};

const dividerVariants: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: 80, opacity: 1, transition: spring },
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

export function SectionHeader({ label, title }: Props) {
  const { ref, isInView } = useInViewReveal();
  const reduced = useReducedMotion();
  const animate = isInView ? 'visible' : 'hidden';

  if (reduced) {
    return (
      <div ref={ref} className="section-header">
        <motion.span
          className="section-label"
          variants={reducedVariants}
          initial="hidden"
          animate={animate}
        >
          {label}
        </motion.span>
        <motion.h2
          className="section-title"
          variants={reducedVariants}
          initial="hidden"
          animate={animate}
        >
          {title}
        </motion.h2>
        <motion.div
          className="section-divider"
          variants={reducedVariants}
          initial="hidden"
          animate={animate}
        />
      </div>
    );
  }

  const chars = title.split('');

  return (
    <div ref={ref} className="section-header">
      <motion.span
        className="section-label"
        variants={labelVariants}
        initial="hidden"
        animate={animate}
      >
        {label}
      </motion.span>
      <motion.h2
        className="section-title"
        variants={titleContainerVariants}
        initial="hidden"
        animate={animate}
      >
        {chars.map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            variants={charVariants}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h2>
      <motion.div
        className="section-divider"
        variants={dividerVariants}
        initial="hidden"
        animate={animate}
      />
    </div>
  );
}
