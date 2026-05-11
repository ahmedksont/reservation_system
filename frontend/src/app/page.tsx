"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Hotel,
  Train,
  Star,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Search,
  Clock,
  Award,
  Heart,
  TrendingUp,
  Globe,
  Phone,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/booking/SearchBar";
import StatsSection from "@/components/layout/StatsSection";
import FeaturedRooms from "@/components/layout/FeaturedRooms";
import TestimonialsSection from "@/components/layout/TestimonialsSection";
import Footer from "@/components/layout/Footer";

/* ─── Sub-components (inline for self-contained redesign) ─────────── */

function FloatingSearch() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto -mt-16 md:-mt-24 relative z-30 px-4"
    >
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Destination */}
          <div className="md:col-span-4 relative group">
            <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 border border-transparent hover:border-amber-200/50">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/40 mb-0.5">
                  Destination
                </span>
                <input
                  type="text"
                  placeholder="Où allez-vous ?"
                  className="bg-transparent text-stone-800 text-base font-semibold placeholder:text-stone-400 focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="md:col-span-3 relative group">
            <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 border border-transparent hover:border-amber-200/50">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/40 mb-0.5">
                  Dates
                </span>
                <span className="text-stone-800 text-base font-semibold">
                  12 — 18 Juin
                </span>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="md:col-span-3 relative group">
            <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/50 hover:bg-white transition-all duration-300 border border-transparent hover:border-amber-200/50">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/40 mb-0.5">
                  Voyageurs
                </span>
                <span className="text-stone-800 text-base font-semibold">
                  2 adultes
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="md:col-span-2">
            <button className="w-full h-full min-h-[64px] rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/30 active:scale-[0.96] group">
              <Search size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="md:hidden lg:inline">Explorer</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DestinationCard({
  city,
  country,
  hotels,
  price,
  image,
  index,
}: {
  city: string;
  country: string;
  hotels: number;
  price: string;
  image: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-3xl cursor-pointer"
    >
      <div className="aspect-[4/5] relative">
        <Image
          src={image}
          alt={city}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-end justify-between">
          <div>
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1"
            >
              {country}
            </motion.p>
            <h3 className="text-white text-3xl font-light font-serif">{city}</h3>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs mb-1">{hotels} propriétés</p>
            <p className="text-white font-medium text-lg">dès {price}</p>
          </div>
        </div>
      </div>
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
          <ArrowRight size={20} />
        </div>
      </div>
    </motion.div>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group p-10 rounded-3xl bg-white border border-stone-100 hover:border-amber-200/50 hover:shadow-[0_20px_50px_rgba(184,118,58,0.06)] transition-all duration-500"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-8 transition-colors duration-500">
        <Icon size={28} className="text-amber-800" />
      </div>
      <h3 className="text-xl font-semibold text-stone-900 mb-4 font-serif">
        {title}
      </h3>
      <p className="text-stone-500 text-base leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors cursor-default">
      <div className="text-amber-400">
        <Icon size={18} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-white font-bold text-base">{value}</span>
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const destinations = [
    {
      city: "Paris",
      country: "France",
      hotels: 1240,
      price: "89€",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=1000&fit=crop",
    },
    {
      city: "Marrakech",
      country: "Maroc",
      hotels: 680,
      price: "65€",
      image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=1000&fit=crop",
    },
    {
      city: "Santorin",
      country: "Grèce",
      hotels: 420,
      price: "120€",
      image: "https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=800&h=1000&fit=crop",
    },
    {
      city: "Kyoto",
      country: "Japon",
      hotels: 350,
      price: "95€",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=1000&fit=crop",
    },
  ];

  const services = [
    {
      icon: Shield,
      title: "Sécurité Absolue",
      desc: "Chaque transaction est protégée par des protocoles bancaires de pointe pour une sérénité totale.",
    },
    {
      icon: Zap,
      title: "Expérience Instantanée",
      desc: "Réservez en un clic et recevez vos documents de voyage immédiatement sur votre mobile.",
    },
    {
      icon: Star,
      title: "Conciergerie 5 Étoiles",
      desc: "Un service d'assistance dédié disponible jour et nuit pour répondre à vos moindres désirs.",
    },
    {
      icon: Clock,
      title: "Liberté Totale",
      desc: "L'imprévu fait partie du voyage. Nos options d'annulation flexible s'adaptent à votre vie.",
    },
    {
      icon: Award,
      title: "Prix Exclusifs",
      desc: "Accédez à des tarifs négociés que vous ne trouverez nulle part ailleurs sur le marché.",
    },
    {
      icon: Heart,
      title: "Collection Curatée",
      desc: "Nous ne listons que le meilleur. Chaque établissement est une promesse d'exception.",
    },
  ];

  const destRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: destScroll } = useScroll({
    target: destRef,
    offset: ["start end", "end start"],
  });
  const destTitleY = useTransform(destScroll, [0, 1], [-100, 100]);

  const serviceRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: serviceScroll } = useScroll({
    target: serviceRef,
    offset: ["start end", "end start"],
  });
  const serviceTitleY = useTransform(serviceScroll, [0, 1], [-80, 80]);

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-stone-800 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-[90dvh] md:h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background Image with Parallax */}
        <motion.div 
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/hero.png"
            alt="Luxury Hotel Hero"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-stone-900/80" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 text-center max-w-6xl mx-auto w-full px-4"
        >
          {mounted && (
            <>
              {/* H1 — Oversized editorial typography */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight leading-[1] mb-10 text-white"
              >
                Redéfinissez votre{" "}
                <span className="text-amber-400 font-normal italic block md:inline">
                  horizon
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-2xl font-light text-white/80 max-w-3xl mx-auto mb-14 leading-relaxed"
              >
                Une sélection exclusive des plus beaux refuges au monde. 
                Vivez une expérience de réservation aussi mémorable que votre séjour.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-6 mb-20 flex-wrap"
              >
                <Link
                  href="/rooms"
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-amber-800 text-white rounded-2xl font-semibold text-base hover:bg-amber-900 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(146,100,50,0.3)] active:scale-[0.98] overflow-hidden"
                >
                  <Hotel size={20} />
                  Réserver un Séjour
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/transport"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-semibold text-base border border-white/20 hover:bg-white/20 transition-all duration-300 active:scale-[0.98]"
                >
                  <Train size={20} />
                  Transports
                </Link>
              </motion.div>

              {/* Trust badges row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex items-center justify-center gap-4 mt-12 flex-wrap"
              >
                <TrustBadge icon={Globe} value="4 800+" label="Hôtels" />
                <TrustBadge icon={Star} value="4.9/5" label="Avis" />
                <TrustBadge icon={Users} value="50k" label="Membres" />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-2 bg-amber-400 rounded-full" 
            />
          </div>
        </motion.div>
      </section>

      {/* Floating Search Bar (Now moved below the hero properly) */}
      <FloatingSearch />

      {/* ── DESTINATIONS ─────────────────────────────────────────────── */}
      <section ref={destRef} className="relative z-10 py-48 px-4 max-w-7xl mx-auto overflow-hidden">
        {/* Large background text */}
        <div className="absolute top-40 left-0 text-[20rem] font-serif font-black text-stone-50 leading-none select-none pointer-events-none -translate-x-1/4">
          World
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-32 gap-8 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-12 bg-amber-800" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800">
                Explorer le monde
              </span>
            </motion.div>
            <motion.h2
              style={{ y: destTitleY }}
              className="text-4xl md:text-8xl font-serif font-light text-stone-900 leading-tight"
            >
              Où votre prochain récit{" "}
              <span className="italic text-amber-800">commence-t-il ?</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/destinations"
              className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-stone-900 hover:text-amber-800 transition-colors"
            >
              Voir la collection
              <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-amber-800 group-hover:bg-amber-800 group-hover:text-white transition-all">
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((d, i) => (
            <DestinationCard key={d.city} {...d} index={i} />
          ))}
        </div>
      </section>

      {/* ── SERVICES (ART DE VIVRE) ──────────────────────────────────── */}
      <section ref={serviceRef} className="relative z-10 py-48 px-4 bg-stone-50 border-y border-stone-100 overflow-hidden">
        {/* Abstract background shape */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-50 rounded-full blur-[150px] -mr-64 -mt-64 opacity-50" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest mb-8"
              >
                Notre Philosophie
              </motion.div>
              <motion.h2
                style={{ y: serviceTitleY }}
                className="text-4xl md:text-8xl font-serif font-light text-stone-900 mb-12 leading-[1.1]"
              >
                L&apos;art de vivre au <span className="italic text-amber-800">quotidien</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-stone-500 text-2xl font-light leading-relaxed mb-16"
              >
                Nous transcendons la simple réservation pour créer des moments d&apos;exception. 
                Chaque détail est orchestré pour votre confort absolu.
              </motion.p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-amber-800 font-serif text-3xl mb-2 italic">24/7</h4>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Assistance</p>
                </div>
                <div>
                  <h4 className="text-amber-800 font-serif text-3xl mb-2 italic">100%</h4>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Sur Mesure</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7">
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={`p-8 rounded-[2.5rem] ${i % 2 === 0 ? 'bg-white shadow-xl shadow-stone-200/50' : 'bg-stone-900 text-white md:translate-y-12'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${i % 2 === 0 ? 'bg-amber-50 text-amber-800' : 'bg-white/10 text-amber-400'}`}>
                      <s.icon size={28} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-4 font-serif ${i % 2 === 0 ? 'text-stone-900' : 'text-white'}`}>
                      {s.title}
                    </h3>
                    <p className={`text-base leading-relaxed ${i % 2 === 0 ? 'text-stone-500' : 'text-stone-400'}`}>
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── FEATURED ROOMS ───────────────────────────────────────────── */}
      <FeaturedRooms />

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── CTA SECTION ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-40 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop"
            alt="Call to Action Background"
            fill
            className="object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-stone-900/80" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-5xl md:text-8xl font-serif font-light text-white mb-10 leading-tight">
              Prêt à vivre votre{" "}
              <span className="italic text-amber-400">prochain voyage</span> ?
            </h2>
            <p className="text-stone-400 text-xl font-light mb-14 max-w-2xl mx-auto leading-relaxed">
              Rejoignez une communauté de voyageurs exigeants. 
              Votre prochaine aventure d&apos;exception n&apos;est qu&apos;à quelques clics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/rooms"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 bg-amber-800 text-white rounded-2xl font-bold text-lg hover:bg-amber-900 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(146,100,50,0.3)] active:scale-[0.98]"
              >
                Commencer l&apos;Aventure
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 active:scale-[0.98]"
              >
                Parler à un Expert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}