import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  noPadding?: boolean;
  hoverEffect?: boolean;
}
export function Card({
  children,
  className = '',
  noPadding = false,
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className={`
        bg-gray-900 border border-gray-800 rounded-lg overflow-hidden
        ${hoverEffect ? 'hover:border-gray-600 transition-colors duration-200' : ''}
        ${noPadding ? '' : 'p-5'}
        ${className}
      `}
      {...props}>

      {children}
    </motion.div>);

}