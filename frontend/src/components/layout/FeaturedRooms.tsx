"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Quote, Bed, Loader2, Users } from "lucide-react";
import { chambreApi } from "@/lib/api";
import type { Chambre } from "@/types";

// Fallback featured rooms if API fails
const FALLBACK_ROOMS: Chambre[] = [
  { id: "f1", numero: "301", type: "SUITE", prixParNuit: 299, description: "Suite luxueuse avec salon séparé, jacuzzi et vue panoramique", capacite: 2, disponible: true, equipements: ["WiFi", "Baignoire", "Petit-déjeuner"], etage: 3, imageUrl: "" },
  { id: "f2", numero: "402", type: "PENTHOUSE", prixParNuit: 599, description: "Penthouse exclusif avec terrasse privée sur les toits", capacite: 4, disponible: true, equipements: ["WiFi", "Baignoire", "Petit-déjeuner", "Climatisation"], etage: 4, imageUrl: "" },
  { id: "f3", numero: "205", type: "DOUBLE", prixParNuit: 149, description: "Chambre double élégante with lit king size and dressing", capacite: 2, disponible: true, equipements: ["WiFi", "Climatisation"], etage: 2, imageUrl: "" },
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
    >
      {/* Image Container */}
      <div className="aspect-[16/10] bg-stone-100 relative overflow-hidden">
        {chambre.imageUrl ? (
          <img 
            src={chambre.imageUrl} 
            alt={`Chambre ${chambre.numero}`} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <Bed size={48} className="text-stone-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-sm ${styles.bg}/80 ${styles.text} ${styles.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}`} />
            {chambre.type}
          </span>
        </div>
        
        {/* Price Tag Overlay */}
        <div className="absolute bottom-6 right-6 px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-serif text-lg">
          {Number(chambre.prixParNuit).toFixed(0)}€ <span className="text-[10px] opacity-60 uppercase tracking-widest">/ nuit</span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
            ))}
          </div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">5.0 Exceptionnel</span>
        </div>
        
        <h3 className="font-serif text-2xl text-stone-900 mb-4 group-hover:text-amber-800 transition-colors">
          Chambre {chambre.numero}
        </h3>
        
        <p className="text-stone-500 text-base leading-relaxed mb-8 line-clamp-2 font-light">
          {chambre.description}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-stone-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-stone-400">
              <Users size={16} />
              <span className="text-xs font-medium">{chambre.capacite}</span>
            </div>
            <div className="w-px h-4 bg-stone-100" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">Étage {chambre.etage}</span>
          </div>
          
          <Link
            href={`/rooms/${chambre.id}`}
            className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-900 hover:bg-amber-800 hover:border-amber-800 hover:text-white transition-all duration-300"
          >
            <ArrowRight size={20} />
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
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(false);
        const { data } = await chambreApi.getDisponibles({ page: 0, size: 6 });
        const fetchedRooms = data?.content || data || [];
        if (fetchedRooms.length > 0) {
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
    <section ref={sectionRef} className="relative z-10 py-48 px-4 bg-white overflow-hidden">
      {/* Decorative background number */}
      <div className="absolute top-20 right-0 text-[30rem] font-serif font-black text-stone-50 leading-none select-none pointer-events-none translate-x-1/2">
        01
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          style={{ y: titleY, opacity }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-32 gap-8"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-amber-800" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800">
                L&apos;Excellence Hôtelière
              </span>
            </div>
            <h2 className="font-serif text-5xl md:text-8xl font-light text-stone-900 leading-tight">
              Notre sélection <span className="italic text-amber-800">exclusive</span>
            </h2>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/rooms"
              className="group inline-flex items-center gap-4 px-10 py-5 rounded-full bg-stone-900 text-white hover:bg-amber-800 transition-all duration-500 shadow-2xl shadow-stone-900/20"
            >
              <span className="text-sm font-bold uppercase tracking-widest">Tout Explorer</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-amber-800 transition-colors">
                <ArrowRight size={16} />
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-stone-100" />
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-stone-100 rounded w-2/3" />
                  <div className="h-4 bg-stone-100 rounded w-full" />
                  <div className="h-4 bg-stone-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((room, i) => (
              <RoomCard key={room.id} chambre={room} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}