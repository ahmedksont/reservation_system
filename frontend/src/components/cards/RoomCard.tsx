"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Users, Wifi, Wind, Coffee, Bath, ArrowRight, MapPin, BedDouble } from "lucide-react";
import type { Chambre } from "@/types";

const equipmentIcons: Record<string, any> = {
  wifi: Wifi, 
  climatisation: Wind, 
  café: Coffee, 
  bain: Bath,
  "petit-déjeuner": Coffee,
  "vue mer": MapPin,
};

interface RoomCardProps {
  chambre: Chambre;
  dateArrivee?: string;
  dateDepart?: string;
  index?: number;
}

export default function RoomCard({ chambre, dateArrivee, dateDepart, index = 0 }: RoomCardProps) {
  const typeLabels: Record<string, string> = {
    SIMPLE: "Chambre Simple", 
    DOUBLE: "Chambre Double",
    SUITE: "Suite Exclusive", 
    PENTHOUSE: "Penthouse Royal", 
    FAMILIALE: "Suite Familiale",
  };

  const params = new URLSearchParams();
  if (dateArrivee) params.set("dateArrivee", dateArrivee);
  if (dateDepart)  params.set("dateDepart", dateDepart);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-100"
    >
      <Link href={`/rooms/${chambre.id}?${params}`} className="block">
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden">
          {chambre.imageUrl ? (
            <img
              src={chambre.imageUrl}
              alt={`Chambre ${chambre.numero}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <BedDouble size={48} className="text-stone-300" />
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          {/* Price Tag */}
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">À partir de</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif font-bold">{chambre.prixParNuit}€</span>
              <span className="text-xs opacity-70">/ nuit</span>
            </div>
          </div>

          {/* Type Badge */}
          <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
            {typeLabels[chambre.type] || chambre.type}
          </div>

          {/* Rating */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/40 backdrop-blur-md rounded-full border border-white/10">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-white text-xs font-bold">4.9</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl text-stone-900 group-hover:text-amber-700 transition-colors">
              Chambre {chambre.numero}
            </h3>
            <div className="flex items-center gap-1.5 text-stone-400 text-sm font-medium">
              <Users size={14} />
              <span>{chambre.capacite} pers.</span>
            </div>
          </div>

          <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-2 font-light">
            {chambre.description || "Un espace de raffinement absolu offrant une vue imprenable et des équipements de première classe pour un séjour inoubliable."}
          </p>

          {/* Equipments */}
          <div className="flex flex-wrap gap-2 mb-8">
            {chambre.equipements?.slice(0, 3).map((eq) => {
              const Icon = equipmentIcons[eq.toLowerCase()] || Wifi;
              return (
                <div
                  key={eq}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400"
                >
                  <Icon size={12} />
                  {eq}
                </div>
              );
            })}
            {chambre.equipements && chambre.equipements.length > 3 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-bold text-stone-400">
                +{chambre.equipements.length - 3}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Voir les détails</span>
            <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center transition-transform group-hover:translate-x-2 group-hover:bg-amber-600">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
