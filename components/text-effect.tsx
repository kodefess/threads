"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion, type Variants, type Transition } from "motion/react"
import React, { type CSSProperties } from "react"

type PresetType = "blur" | "shake" | "scale" | "fade" | "slide"

export type TextEffectProps = {
  children: string
  per?: "word" | "char" | "line"
  as?: keyof React.JSX.IntrinsicElements
  variants?: {
    container?: Variants
    item?: Variants
  }
  className?: string
  preset?: PresetType
  delay?: number
  trigger?: boolean
  onAnimationComplete?: () => void
  onAnimationStart?: () => void
  segmentWrapperClassName?: string
  style?: CSSProperties
  containerTransition?: Transition
  segmentTransition?: Transition
  speedReveal?: number
  speedSegment?: number
}

const defaultStaggerTimes: Record<"char" | "word" | "line", number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
}

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const presetVariants: Record<PresetType, { container: Variants; item: Variants }> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(12px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(12px)" },
    },
  },
  shake: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 0 },
      visible: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } },
      exit: { x: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  },
}

const AnimationComponent: React.FC<{
  segment: string
  variants: Variants
  per: "line" | "word" | "char"
  segmentWrapperClassName?: string
  segmentTransition?: Transition
}> = React.memo(({ segment, variants, per, segmentWrapperClassName, segmentTransition }) => {
  const content =
    per === "line" ? (
      <motion.span variants={variants} className="block" transition={segmentTransition}>
        {segment}
      </motion.span>
    ) : per === "word" ? (
      <motion.span
        aria-hidden="true"
        variants={variants}
        className="inline-block whitespace-pre"
        transition={segmentTransition}
      >
        {segment}
      </motion.span>
    ) : (
      <motion.span className="inline-block whitespace-pre">
        {segment.split("").map((char, charIndex) => (
          <motion.span
            key={`char-${charIndex}`}
            aria-hidden="true"
            variants={variants}
            className="inline-block whitespace-pre"
            transition={segmentTransition}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    )

  if (!segmentWrapperClassName) return content

  const defaultWrapperClassName = per === "line" ? "block" : "inline-block"

  return <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>{content}</span>
})
AnimationComponent.displayName = "AnimationComponent"

const splitText = (text: string, per: "line" | "word" | "char") => {
  if (per === "line") return text.split("\n")
  return text.split(/(\s+)/)
}

export function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset,
  delay = 0,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  style,
  containerTransition,
  segmentTransition,
  speedReveal = 1,
  speedSegment = 1,
}: TextEffectProps) {
  const MotionTag = motion.create(as as keyof React.JSX.IntrinsicElements) as typeof motion.div
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants }
  const containerVariants = variants?.container || selectedVariants.container
  const itemVariants = variants?.item || selectedVariants.item
  const ariaLabel = per === "line" ? undefined : children

  const stagger = defaultStaggerTimes[per] / speedReveal

  const delayedContainerVariants: Variants = {
    hidden: containerVariants.hidden,
    visible: {
      ...containerVariants.visible,
      transition: {
        ...(typeof containerVariants.visible === "object" && "transition" in containerVariants.visible
          ? containerVariants.visible.transition
          : {}),
        staggerChildren: stagger,
        delayChildren: delay,
        ...containerTransition,
      },
    },
    exit: containerVariants.exit,
  }

  const segments = splitText(children, per)

  const computedSegmentTransition: Transition = {
    duration: 0.3 / speedSegment,
    ...segmentTransition,
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label={ariaLabel}
          variants={delayedContainerVariants}
          className={cn("whitespace-pre-wrap", className)}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
          style={style}
        >
          {per !== "line" && <span className="sr-only">{children}</span>}
          {segments.map((segment, index) => (
            <AnimationComponent
              key={`${per}-${index}-${segment}`}
              segment={segment}
              variants={itemVariants}
              per={per}
              segmentWrapperClassName={segmentWrapperClassName}
              segmentTransition={computedSegmentTransition}
            />
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
