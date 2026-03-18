import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function useInViewReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: 0.08,
    margin: '0px 0px -60px 0px',
    once: true,
  });

  return { ref, isInView };
}
