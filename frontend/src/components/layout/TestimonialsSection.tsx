"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sophie M.",
    role: "Voyageuse premium",
    rating: 5,
    text: "Une expérience qui dépasse toutes mes attentes. La fluidité de la réservation et la qualité des établissements sélectionnés sont tout simplement remarquables.",
  },
  {
    name: "Alexandre D.",
    role: "Directeur commercial",
    rating: 5,
    text: "Enfin une plateforme qui comprend les besoins des voyageurs exigeants. Le service client est d'une réactivité exemplaire. Je ne jure plus que par LuxeStay.",
  },
  {
    name: "Inès K.",
    role: "Blogueuse voyage",
    rating: 5,
    text: "L'interface est un véritable bijou. Chaque interaction est pensée pour le plaisir des yeux. C'est l'outil parfait pour organiser des séjours inoubliables.",
  },
];

export default function TestimonialsSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Create different horizontal translations for each card
  const x1 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const x2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const x3 = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  
  // Opacity and scale transforms
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const xTransforms = [x1, x2, x3];

  return (
    <section ref={containerRef} className="relative z-10 py-48 px-4 bg-white overflow-hidden">
      {/* Decorative quotes background */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <Quote size={400} className="text-stone-900" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-32 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-[1px] w-8 bg-amber-800/30" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800">
              Paroles de Voyageurs
            </span>
            <div className="h-[1px] w-8 bg-amber-800/30" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl font-serif font-light text-stone-900 leading-tight"
          >
            Ils nous font une <span className="italic text-amber-800">confiance absolue</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative z-10">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              style={{ 
                x: xTransforms[i],
                opacity,
                scale
              }}
              className="group p-12 rounded-[4rem] bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-[0_60px_100px_rgba(0,0,0,0.08)] transition-colors duration-700 relative"
            >
              {/* Floating Quote Icon */}
              <div className="absolute -top-6 -left-6 w-16 h-16 rounded-3xl bg-amber-800 text-white flex items-center justify-center shadow-2xl shadow-amber-900/20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Quote size={24} />
              </div>

              <div className="flex gap-1 mb-10 mt-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
              
              <p className="text-stone-600 text-xl leading-relaxed mb-12 font-light italic">
                &quot;{t.text}&quot;
              </p>
              
              <div className="flex items-center gap-5 pt-10 border-t border-stone-200/50">
                <div className="w-16 h-16 rounded-3xl bg-stone-200 flex items-center justify-center text-stone-600 font-serif text-2xl font-medium overflow-hidden">
                  <span className="group-hover:scale-125 transition-transform duration-500">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-stone-900 font-bold text-lg">{t.name}</p>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

