"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Quote } from "lucide-react";
import RoomCard from "@/components/cards/RoomCard";
import type { Chambre } from "@/types";

const FEATURED: Chambre[] = [
  { id: "f1", numero: "301", type: "SUITE", prixParNuit: 299, description: "Suite luxueuse avec salon séparé, jacuzzi et vue panoramique", capacite: 2, disponible: true, equipements: ["wifi", "bain", "café"], etage: 3 },
  { id: "f2", numero: "402", type: "PENTHOUSE", prixParNuit: 599, description: "Penthouse exclusif avec terrasse privée sur les toits", capacite: 4, disponible: true, equipements: ["wifi", "bain", "café", "climatisation"], etage: 4 },
  { id: "f3", numero: "205", type: "DOUBLE", prixParNuit: 149, description: "Chambre double élégante avec lit king size et dressing", capacite: 2, disponible: true, equipements: ["wifi", "climatisation"], etage: 2 },
];

export default function FeaturedRooms() {
  return (
    <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Notre sélection</p>
          <h2 className="font-display text-5xl font-light text-night-50">
            Chambres <span className="gold-text font-semibold">vedettes</span>
          </h2>
        </div>
        <Link href="/rooms" className="hidden md:flex btn-ghost items-center gap-2 text-sm">
          Tout voir <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {FEATURED.map((room, i) => (
          <RoomCard key={room.id} chambre={room} index={i} />
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Link href="/rooms" className="btn-ghost">Voir toutes les chambres <ArrowRight size={15} /></Link>
      </div>
    </section>
  );
}

// --- Testimonials ---
const TESTIMONIALS = [
  { name: "Sophie M.", role: "Voyageuse premium", rating: 5, text: "Expérience incroyable. La réservation s'est faite en quelques secondes et la chambre était exactement comme décrite. Je recommande vivement !" },
  { name: "Alexandre D.", role: "Directeur commercial", rating: 5, text: "Service irréprochable. Le paiement Stripe est rassurant et j'ai reçu ma confirmation immédiatement. Parfait pour les voyages d'affaires." },
  { name: "Inès K.", role: "Blogueuse voyage", rating: 5, text: "Interface magnifique et intuitive. On sent que l'équipe a mis du cœur dans la conception. Le meilleur site de réservation que j'ai utilisé." },
];

export function TestimonialsSection() {
  return (
    <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Avis clients</p>
        <h2 className="font-display text-5xl font-light text-night-50">
          Ils nous font <span className="gold-text font-semibold">confiance</span>
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
            <p className="text-night-300 text-sm leading-relaxed mb-6 italic">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
                <span className="font-display text-gold-400 font-semibold text-sm">{t.name[0]}</span>
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

// --- Footer ---
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-night-800/60 py-16 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}>
              <span className="text-night-950 font-display font-bold">L</span>
            </div>
            <span className="font-display text-lg text-night-50">LuxeStay</span>
          </div>
          <p className="text-night-500 text-sm leading-relaxed">Votre partenaire de voyage premium. Hôtels et transports de luxe, réservés en un instant.</p>
        </div>
        {[
          { title: "Services", links: ["Hôtels", "Transports", "Forfaits", "Business"] },
          { title: "Aide", links: ["FAQ", "Annulations", "Contact", "Politique de confidentialité"] },
          { title: "Légal", links: ["CGU", "Mentions légales", "Cookies", "RGPD"] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-night-200 font-medium text-sm mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(l => (
                <li key={l}><a href="#" className="text-night-500 hover:text-gold-400 text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-night-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-night-600 text-xs">© 2025 LuxeStay & Transit. Tous droits réservés.</p>
        <p className="text-night-600 text-xs flex items-center gap-1.5">
          Paiements sécurisés par
          <span className="text-gold-600 font-medium">Stripe</span>
          · Base de données
          <span className="text-gold-600 font-medium">Supabase</span>
        </p>
      </div>
    </footer>
  );
}
