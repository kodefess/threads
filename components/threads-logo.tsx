"use client"

import { motion } from "framer-motion"

export function ThreadsLogo() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.1,
      }}
      className="relative"
    >
      {/* Outer glow container */}
      <div className="relative">
        {/* Radial rays behind the logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="absolute w-40 h-40">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 h-[1px] w-16 origin-left"
                style={{
                  rotate: `${i * 15}deg`,
                  background: `linear-gradient(90deg, oklch(0.985 0 0 / 0.2) 0%, transparent 100%)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.02, duration: 0.5 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Ambient glow */}
        <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-2xl" />

        {/* Main logo container with 3D glass effect */}
        <motion.div
          className="relative h-24 w-24 rounded-[1.75rem] flex items-center justify-center"
          whileHover={{
            scale: 1.05,
            rotateY: 10,
            rotateX: -5,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] shadow-[0_0_40px_rgba(255,255,255,0.1)]" />

          {/* Inner glass layer */}
          <div className="absolute inset-[2px] rounded-[1.625rem] bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-[#000000] overflow-hidden">
            {/* Top reflection */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/[0.08] to-transparent" />

            {/* Bottom subtle reflection */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/[0.02] to-transparent" />

            {/* Moving shine effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: [0, 0.3, 0] }}
              transition={{
                duration: 2,
                delay: 1,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 4,
              }}
            >
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
            </motion.div>
          </div>

          {/* Border highlight */}
          <div className="absolute inset-0 rounded-[1.75rem] border border-white/[0.08]" />

          <motion.svg
            viewBox="0 0 24 25"
            fill="none"
            className="relative z-10 w-12 h-12 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a0a0a0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M16.906 12.001a7 7 0 0 0-.269-.122c-.158-2.915-1.75-4.584-4.424-4.602h-.036c-1.6 0-2.93.683-3.749 1.926l1.47 1.01c.612-.929 1.572-1.127 2.28-1.127h.024c.88.006 1.544.262 1.975.761q.47.548.625 1.5a11.3 11.3 0 0 0-2.527-.121c-2.542.146-4.177 1.63-4.067 3.69.056 1.046.576 1.945 1.466 2.533.752.497 1.72.74 2.728.685 1.33-.073 2.372-.58 3.1-1.509.553-.704.902-1.617 1.057-2.768.633.382 1.103.886 1.362 1.49.441 1.03.467 2.72-.912 4.098-1.208 1.208-2.66 1.73-4.855 1.746-2.434-.018-4.275-.799-5.472-2.321-1.121-1.426-1.7-3.485-1.722-6.12.021-2.635.6-4.694 1.722-6.12 1.197-1.522 3.038-2.303 5.472-2.32 2.452.018 4.326.803 5.568 2.332.61.75 1.07 1.694 1.372 2.794l1.723-.46c-.367-1.354-.944-2.52-1.73-3.488C17.492 3.526 15.163 2.52 12.16 2.5h-.012c-2.996.02-5.3 1.03-6.849 2.998-1.377 1.752-2.088 4.19-2.111 7.245v.014c.023 3.056.734 5.493 2.111 7.245 1.548 1.969 3.853 2.977 6.85 2.998h.011c2.664-.018 4.542-.716 6.089-2.262 2.024-2.023 1.963-4.559 1.296-6.115-.479-1.116-1.391-2.023-2.639-2.622m-4.6 4.327c-1.114.062-2.271-.438-2.328-1.51-.043-.794.565-1.68 2.397-1.787q.315-.018.618-.018c.665 0 1.288.065 1.854.189-.211 2.637-1.45 3.066-2.54 3.126Z"
              fill="url(#logoGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.div>

        {/* Bottom reflection/shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/5 rounded-full blur-md" />
      </div>
    </motion.div>
  )
}
