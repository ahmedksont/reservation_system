"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Hotel, Train, Star, Shield, Zap, ArrowRight, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/booking/SearchBar";
import StatsSection from "@/components/layout/StatsSection";
import FeaturedRooms from "@/components/cards/FeaturedRooms";
import TestimonialsSection from "@/components/layout/TestimonialsSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Particle animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

  const features = [
    { icon: Shield, title: "Paiement sécurisé", desc: "Transactions chiffrées via Stripe" },
    { icon: Zap, title: "Confirmation instantanée", desc: "Réservation confirmée en temps réel" },
    { icon: Star, title: "Service premium", desc: "Support 24h/24, 7j/7" },
  ];

  return (
    <div className="relative min-h-screen bg-night-950 overflow-hidden">
      <canvas ref={canvasRef} id="particle-canvas" />

      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #F59E0B 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: "radial-gradient(ellipse, #FBBF24 0%, transparent 70%)" }}
          />
        </div>

        {mounted && (
          <div className="relative z-10 text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}
            >
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-400 text-sm font-medium tracking-wider uppercase">Plateforme Premium</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-6xl md:text-8xl font-light text-night-50 leading-tight mb-6"
            >
              Voyagez avec{" "}
              <span className="gold-shimmer font-semibold">élégance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-night-300 text-xl font-light max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Réservez vos chambres d&apos;hôtel et billets de transport en quelques secondes.
              Une expérience raffinée, une technologie de pointe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-16"
            >
              <Link href="/rooms" className="btn-gold text-base px-8 py-4">
                <Hotel size={18} />
                Hôtels
                <ArrowRight size={16} />
              </Link>
              <Link href="/transport" className="btn-ghost text-base px-8 py-4">
                <Train size={18} />
                Transports
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <SearchBar />
            </motion.div>
          </div>
        )}

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-night-500 text-xs uppercase tracking-widest">Découvrir</span>
          <ChevronDown size={16} className="text-gold-600" />
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-24 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card glass-card-hover p-8"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
              >
                <f.icon size={22} className="text-gold-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-night-50 mb-2">{f.title}</h3>
              <p className="text-night-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <StatsSection />

      {/* FEATURED ROOMS */}
      <FeaturedRooms />

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      <Footer />
    </div>
  );
}
