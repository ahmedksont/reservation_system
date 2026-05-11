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
import FeaturedRooms from "@/components/cards/FeaturedRooms";
import TestimonialsSection from "@/components/layout/TestimonialsSection";
import Footer from "@/components/layout/Footer";

/* ─── Sub-components (inline for self-contained redesign) ─────────── */

function FloatingSearch() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="glass-panel rounded-2xl p-2 md:p-4 shadow-2xl shadow-stone-900/5 border border-white/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
          {/* Destination */}
          <div className="md:col-span-4 relative group">
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white/80 hover:bg-white transition-colors border border-transparent hover:border-stone-200">
              <MapPin size={18} className="text-amber-700 shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Destination
                </span>
                <input
                  type="text"
                  placeholder="Où allez-vous ?"
                  className="bg-transparent text-stone-800 text-sm font-medium placeholder:text-stone-400 focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="md:col-span-3 relative group">
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white/80 hover:bg-white transition-colors border border-transparent hover:border-stone-200">
              <Calendar size={18} className="text-amber-700 shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Dates
                </span>
                <span className="text-stone-800 text-sm font-medium">
                  12 — 18 Juin
                </span>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="md:col-span-3 relative group">
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white/80 hover:bg-white transition-colors border border-transparent hover:border-stone-200">
              <Users size={18} className="text-amber-700 shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Voyageurs
                </span>
                <span className="text-stone-800 text-sm font-medium">
                  2 adultes
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="md:col-span-2">
            <button className="w-full h-full min-h-[56px] rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-900/20 active:scale-[0.98]">
              <Search size={16} />
              Rechercher
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
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
    >
      <div className="aspect-[4/5] relative">
        <Image
          src={image}
          alt={city}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-white text-xl font-semibold font-serif">{city}</h3>
            <p className="text-white/70 text-sm">{country}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">{hotels} hôtels</p>
            <p className="text-white font-semibold text-sm">dès {price}</p>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
          <ArrowRight size={16} className="text-white" />
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
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="group p-8 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-6 transition-colors">
        <Icon size={24} className="text-amber-800" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2 font-serif">
        {title}
      </h3>
      <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
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
    <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-stone-200/60">
      <Icon size={16} className="text-amber-700" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-stone-900 font-bold text-sm">{value}</span>
        <span className="text-stone-500 text-xs">{label}</span>
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
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -80]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const destinations = [
    {
      city: "Paris",
      country: "France",
      hotels: 1240,
      price: "89€",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=750&fit=crop",
    },
    {
      city: "Marrakech",
      country: "Maroc",
      hotels: 680,
      price: "65€",
      image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=750&fit=crop",
    },
    {
      city: "Santorin",
      country: "Grèce",
      hotels: 420,
      price: "120€",
      image: "https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=600&h=750&fit=crop",
    },
    {
      city: "Kyoto",
      country: "Japon",
      hotels: 350,
      price: "95€",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=750&fit=crop",
    },
  ];

  const services = [
    {
      icon: Shield,
      title: "Paiement sécurisé",
      desc: "Transactions chiffrées de bout en bout via Stripe. Vos données sont protégées à chaque instant.",
    },
    {
      icon: Zap,
      title: "Confirmation instantanée",
      desc: "Recevez votre confirmation en temps réel. Plus d'attente, plus d'incertitude.",
    },
    {
      icon: Star,
      title: "Service premium",
      desc: "Notre équipe d'experts est disponible 24h/24 et 7j/7 pour vous accompagner.",
    },
    {
      icon: Clock,
      title: "Annulation flexible",
      desc: "Modifiez ou annulez votre réservation jusqu'à 24h avant votre arrivée.",
    },
    {
      icon: Award,
      title: "Meilleur prix garanti",
      desc: "Trouvez un prix inférieur ailleurs ? Nous égalons la différence.",
    },
    {
      icon: Heart,
      title: "Sélection exclusive",
      desc: "Chaque hôtel est inspecté et validé par nos équipes pour une qualité irréprochable.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-stone-800 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden"
      >
        {/* Subtle warm ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-amber-100/40 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-50/50 blur-[100px]" />
          <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-stone-100/60 blur-[80px]" />
        </div>

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #78716c 1px, transparent 1px), linear-gradient(to bottom, #78716c 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center max-w-5xl mx-auto w-full"
        >
          {mounted && (
            <>
              {/* Premium badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200/60 mb-10"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-amber-800">
                  Plateforme Premium
                </span>
              </motion.div>

              {/* H1 — Oversized editorial typography */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-8 text-stone-900"
              >
                Voyagez avec{" "}
                <span className="text-amber-800 font-medium italic">
                  élégance
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-lg md:text-xl font-light text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed"
              >
                Réservez vos chambres d&apos;hôtel et billets de transport en
                quelques secondes. Une expérience raffinée, une technologie de
                pointe.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex items-center justify-center gap-4 mb-16 flex-wrap"
              >
                <Link
                  href="/rooms"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-xl hover:shadow-stone-900/20 active:scale-[0.98]"
                >
                  <Hotel size={18} />
                  Explorer les Hôtels
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/transport"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-stone-800 rounded-xl font-medium text-sm border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all active:scale-[0.98]"
                >
                  <Train size={18} />
                  Transports
                </Link>
              </motion.div>

              {/* Floating Search Bar */}
              <FloatingSearch />

              {/* Trust badges row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center justify-center gap-3 mt-10 flex-wrap"
              >
                <TrustBadge icon={Globe} value="4 820" label="Hôtels" />
                <TrustBadge icon={Star} value="98%" label="Satisfaction" />
                <TrustBadge icon={Users} value="50k+" label="Voyageurs" />
                <TrustBadge icon={Phone} value="24/7" label="Support" />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Découvrir
          </span>
          <ChevronDown size={16} className="text-stone-400" />
        </motion.div>
      </section>

      {/* ── DESTINATIONS ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block"
            >
              Destinations populaires
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-light text-stone-900"
            >
              Où irez-vous{" "}
              <span className="italic text-amber-800">ensuite ?</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/destinations"
              className="group inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-amber-800 transition-colors"
            >
              Voir toutes les destinations
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((d, i) => (
            <DestinationCard key={d.city} {...d} index={i} />
          ))}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block"
            >
              Pourquoi nous choisir
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-light text-stone-900 mb-4"
            >
              L&apos;excellence à chaque{" "}
              <span className="italic text-amber-800">étape</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-stone-500 max-w-xl mx-auto"
            >
              Nous avons repensé chaque détail de votre expérience de réservation
              pour qu&apos;elle soit fluide, sécurisée et agréable.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <ServiceCard key={s.title} {...s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "4 820+", label: "Hôtels partenaires" },
              { value: "98%", label: "Clients satisfaits" },
              { value: "150k+", label: "Réservations" },
              { value: "4.9", label: "Note moyenne" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-serif font-light text-amber-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-stone-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ROOMS (existing component) ──────────────────────── */}
      <FeaturedRooms />

      {/* ── TESTIMONIALS (existing component) ────────────────────────── */}
      <TestimonialsSection />

      {/* ── CTA SECTION ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-stone-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-serif font-light text-stone-900 mb-6 leading-tight">
              Prêt à vivre votre{" "}
              <span className="italic text-amber-800">prochain voyage</span> ?
            </h2>
            <p className="text-stone-500 text-lg mb-10 max-w-xl mx-auto">
              Rejoignez plus de 50 000 voyageurs qui nous font confiance. Votre
              prochaine aventure commence ici.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2.5 px-10 py-5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all hover:shadow-xl hover:shadow-stone-900/20 active:scale-[0.98]"
              >
                <TrendingUp size={18} />
                Commencer maintenant
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}