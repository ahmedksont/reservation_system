"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sophie M.",
    role: "Voyageuse premium",
    rating: 5,
    text: "Expérience incroyable. La réservation s'est faite en quelques secondes et la chambre était exactement comme décrite. Je recommande vivement !",
  },
  {
    name: "Alexandre D.",
    role: "Directeur commercial",
    rating: 5,
    text: "Service irréprochable. Le paiement Stripe est rassurant et j'ai reçu ma confirmation immédiatement. Parfait pour les voyages d'affaires.",
  },
  {
    name: "Inès K.",
    role: "Blogueuse voyage",
    rating: 5,
    text: "Interface magnifique et intuitive. On sent que l'équipe a mis du cœur dans la conception. Le meilleur site de réservation que j'ai utilisé.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">
          Avis clients
        </p>
        <h2 className="font-display text-5xl font-light text-night-50">
          Ils nous font{" "}
          <span className="gold-text font-semibold">confiance</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card glass-card-hover p-7"
          >
            <Quote size={24} className="text-gold-700 mb-4" />
            <p className="text-night-300 text-sm leading-relaxed mb-6 italic">
              {t.text}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
                <span className="font-display text-gold-400 font-semibold text-sm">
                  {t.name[0]}
                </span>
              </div>
              <div>
                <p className="text-night-100 text-sm font-medium">{t.name}</p>
                <p className="text-night-500 text-xs">{t.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

