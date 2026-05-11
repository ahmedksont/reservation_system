"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString("fr")}{suffix}</span>;
}

export default function StatsSection() {
  const stats = [
    { value: 4820, suffix: "+", label: "Hôtels de Prestige" },
    { value: 150,  suffix: "k+", label: "Voyageurs Comblés" },
    { value: 98,   suffix: "%", label: "Indice de Satisfaction" },
    { value: 24,   suffix: "h", label: "Accompagnement Dédié" },
  ];

  return (
    <section className="relative z-10 py-16 px-4">
      <div className="max-w-7xl mx-auto overflow-hidden rounded-[3rem] bg-stone-900 shadow-2xl relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/30 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-800/50 blur-[100px] rounded-full" />
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5 py-12 md:py-20">
          {stats.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center px-4 py-8 md:py-0"
            >
              <div className="font-serif text-4xl md:text-6xl font-light text-amber-400 mb-4 tracking-tight">
                <CountUp target={value} suffix={suffix} />
              </div>
              <p className="text-stone-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
