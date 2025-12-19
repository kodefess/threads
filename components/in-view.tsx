"use client"

import type React from "react"

import { motion, useInView, type Variant, type Transition, type UseInViewOptions } from "motion/react"
import { useRef, type ReactNode } from "react"

type InViewProps = {
  children: ReactNode
  variants?: {
    hidden: Variant
    visible: Variant
  }
  transition?: Transition
  viewOptions?: UseInViewOptions
  as?: React.ElementType
  once?: boolean
}

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = "div",
  once = true,
}: InViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, ...viewOptions })
  const MotionComponent = motion.create(as)

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={transition}
    >
      {children}
    </MotionComponent>
  )
}
