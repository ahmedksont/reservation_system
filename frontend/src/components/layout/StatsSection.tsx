"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
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
    { value: 12400, suffix: "+", label: "Réservations effectuées" },
    { value: 340,   suffix: "",  label: "Hôtels partenaires" },
    { value: 98,    suffix: "%", label: "Clients satisfaits" },
    { value: 24,    suffix: "/7",label: "Support client" },
  ];

  return (
    <section className="relative z-10 py-20 px-4">
      <div
        className="max-w-5xl mx-auto rounded-2xl p-12"
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 100%)",
          border: "1px solid rgba(251,191,36,0.12)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-semibold text-gold-400 mb-2">
                <CountUp target={value} suffix={suffix} />
              </div>
              <p className="text-night-400 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
