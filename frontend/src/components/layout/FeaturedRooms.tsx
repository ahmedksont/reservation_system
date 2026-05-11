"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Quote, Bed, Loader2 } from "lucide-react";
import { chambreApi } from "@/lib/api";
import type { Chambre } from "@/types";
import toast from "react-hot-toast";

// Fallback featured rooms if API fails
const FALLBACK_ROOMS: Chambre[] = [
  { id: "f1", numero: "301", type: "SUITE", prixParNuit: 299, description: "Suite luxueuse avec salon séparé, jacuzzi et vue panoramique", capacite: 2, disponible: true, equipements: ["WiFi", "Baignoire", "Petit-déjeuner"], etage: 3, imageUrl: "" },
  { id: "f2", numero: "402", type: "PENTHOUSE", prixParNuit: 599, description: "Penthouse exclusif avec terrasse privée sur les toits", capacite: 4, disponible: true, equipements: ["WiFi", "Baignoire", "Petit-déjeuner", "Climatisation"], etage: 4, imageUrl: "" },
  { id: "f3", numero: "205", type: "DOUBLE", prixParNuit: 149, description: "Chambre double élégante avec lit king size et dressing", capacite: 2, disponible: true, equipements: ["WiFi", "Climatisation"], etage: 2, imageUrl: "" },
];

const ROOM_TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  SIMPLE: { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-700" },
  DOUBLE: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  SUITE: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  PENTHOUSE: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  FAMILIALE: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
};

function RoomCard({ chambre, index }: { chambre: Chambre; index: number }) {
  const styles = ROOM_TYPE_STYLES[chambre.type] || ROOM_TYPE_STYLES.SIMPLE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
    >
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-50 relative overflow-hidden">
        {chambre.imageUrl ? (
          <img src={chambre.imageUrl} alt={`Chambre ${chambre.numero}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bed size={48} className="text-stone-200" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${styles.bg} ${styles.text} ${styles.border}`}>
            {chambre.type}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-serif text-lg text-stone-900">Chambre {chambre.numero}</h3>
          <span className="font-serif text-xl font-semibold text-amber-700">
            {Number(chambre.prixParNuit).toFixed(0)}€
          </span>
        </div>
        <p className="text-stone-500 text-sm mb-4 line-clamp-2">{chambre.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-stone-400 text-xs">
            <span>{chambre.capacite} pers.</span>
            <span>·</span>
            <span>Étage {chambre.etage}</span>
          </div>
          <Link
            href={`/rooms/${chambre.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-stone-700 hover:text-amber-700 transition-colors"
          >
            Voir <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedRooms() {
  const [rooms, setRooms] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(false);

        // Fetch rooms from API - using getDisponibles with params
        const { data } = await chambreApi.getDisponibles({ page: 0, size: 6 });

        const fetchedRooms = data?.content || data || [];

        if (fetchedRooms.length > 0) {
          // Sort by price descending and take top 3
          const featured = fetchedRooms
            .filter((r: Chambre) => r.disponible)
            .sort((a: Chambre, b: Chambre) => b.prixParNuit - a.prixParNuit)
            .slice(0, 3);

          setRooms(featured.length > 0 ? featured : FALLBACK_ROOMS);
        } else {
          setRooms(FALLBACK_ROOMS);
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError(true);
        setRooms(FALLBACK_ROOMS);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-2 block">
            Notre sélection
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-900 leading-tight">
            Chambres <span className="italic text-amber-800">vedettes</span>
          </h2>
        </div>
        <Link
          href="/rooms"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all text-sm font-medium border border-transparent hover:border-stone-200"
        >
          Tout voir <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-stone-200 rounded w-2/3" />
                <div className="h-4 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map((room, i) => (
              <RoomCard key={room.id} chambre={room} index={i} />
            ))}
          </div>
          {error && (
            <p className="text-center text-stone-400 text-sm mt-4">
              Affichage des chambres de démonstration
            </p>
          )}
        </>
      )}

      <div className="mt-8 text-center md:hidden">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all text-sm font-medium"
        >
          Voir toutes les chambres <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

// --- Testimonials (static, no API needed) ---
const TESTIMONIALS = [
  { name: "Sophie M.", role: "Voyageuse premium", rating: 5, text: "Expérience incroyable. La réservation s'est faite en quelques secondes et la chambre était exactement comme décrite. Je recommande vivement !" },
  { name: "Alexandre D.", role: "Directeur commercial", rating: 5, text: "Service irréprochable. Le paiement Stripe est rassurant et j'ai reçu ma confirmation immédiatement. Parfait pour les voyages d'affaires." },
  { name: "Inès K.", role: "Blogueuse voyage", rating: 5, text: "Interface magnifique et intuitive. On sent que l'équipe a mis du cœur dans la conception. Le meilleur site de réservation que j'ai utilisé." },
];

export function TestimonialsSection() {
  return (
    <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-2 block">
          Avis clients
        </span>
        <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-900 leading-tight">
          Ils nous font <span className="italic text-amber-800">confiance</span>
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
            className="bg-white rounded-2xl border border-stone-200/80 p-7 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
          >
            <Quote size={24} className="text-amber-300 mb-4" />
            <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <span className="font-serif text-amber-700 font-semibold text-sm">{t.name[0]}</span>
              </div>
              <div>
                <p className="text-stone-900 text-sm font-medium">{t.name}</p>
                <p className="text-stone-500 text-xs">{t.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="text-amber-500 fill-amber-500" />
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
    <footer className="relative z-10 border-t border-stone-200/60 py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600">
              <span className="text-white font-serif font-bold">L</span>
            </div>
            <span className="font-serif text-lg text-stone-900">LuxeStay</span>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed">
            Votre partenaire de voyage premium. Hôtels et transports de luxe, réservés en un instant.
          </p>
        </div>
        {[
          { title: "Services", links: ["Hôtels", "Transports", "Forfaits", "Business"] },
          { title: "Aide", links: ["FAQ", "Annulations", "Contact", "Politique de confidentialité"] },
          { title: "Légal", links: ["CGU", "Mentions légales", "Cookies", "RGPD"] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-stone-900 font-medium text-sm mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(l => (
                <li key={l}>
                  <a href="#" className="text-stone-500 hover:text-amber-700 text-sm transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-stone-400 text-xs">© 2025 LuxeStay & Transit. Tous droits réservés.</p>
        <p className="text-stone-400 text-xs flex items-center gap-1.5">
          Paiements sécurisés par
          <span className="text-amber-700 font-medium">Stripe</span>
          · Base de données
          <span className="text-amber-700 font-medium">Supabase</span>
        </p>
      </div>
    </footer>
  );
}