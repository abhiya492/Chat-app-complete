import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const ButtonHover = ({ children, className = '', ...props }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const CardHover = ({ children, className = '', ...props }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const FadeIn = ({ children, delay = 0, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideIn = ({ children, direction = 'left', className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  const directions = {
    left: { x: -50 },
    right: { x: 50 },
    up: { y: -50 },
    down: { y: 50 }
  };

  const variants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, ...directions[direction] },
    visible: { opacity: 1, x: 0, y: 0 }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn = ({ children, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, type: 'spring' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
