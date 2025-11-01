/**
 * Framer Motion animation variants
 * Reusable animation configurations for consistent motion across the app
 */
import { Variants } from 'framer-motion'

/**
 * Container variant for staggered children animations
 * Use for grids, lists, and other collections
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

/**
 * Item variant for individual cards/items
 * Scale and fade from center
 */
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
      filter: {
        duration: 0.5,
      },
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.15)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
}

/**
 * Modal variant for popup dialogs
 * Scale and fade effect with spring
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
}

/**
 * Button variant for interactive elements
 * Hover and tap animations with spring
 */
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

/**
 * Fade in variant
 * Smooth opacity animation
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Slide in from left variant
 */
export const slideInLeftVariants: Variants = {
  hidden: {
    x: -50,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Page transition variant
 * Smooth page entrance with subtle bounce
 */
export const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
}

/**
 * Card hover variant
 * Subtle lift effect for cards
 */
export const cardHoverVariants: Variants = {
  idle: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    y: -4,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
}

/**
 * Content fade in variant for card content
 * Subtle animation for text and elements inside cards
 */
export const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Scroll-triggered animation variants
 * For cards that animate in when they come into view
 */
export const scrollItemVariants = (index: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 30,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.15, // Stagger delay based on index
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
})
