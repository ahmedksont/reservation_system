"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time or wait for window load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950"
        >
          <div className="relative flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-32 h-32 mb-8"
            >
              <Image
                src="/logo.png"
                alt="LuxeStay Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Text Animation */}
            <div className="overflow-hidden h-10 mb-2">
              <motion.h1
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="font-serif text-3xl font-bold text-white tracking-tight"
              >
                LuxeStay <span className="text-amber-500">& Transit</span>
              </motion.h1>
            </div>

            {/* Loading Bar */}
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              />
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-stone-500"
            >
              Stay Beyond Horizons
            </motion.p>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-amber-500/10 blur-[150px] rounded-full"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-stone-800/20 blur-[150px] rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
