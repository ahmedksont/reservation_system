"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Users, Wifi, Wind, Coffee, Bath, ArrowRight } from "lucide-react";
import type { Chambre } from "@/types";

const equipmentIcons: Record<string, typeof Wifi> = {
  wifi: Wifi, climatisation: Wind, café: Coffee, bain: Bath,
};

interface RoomCardProps {
  chambre: Chambre;
  dateArrivee?: string;
  dateDepart?: string;
  index?: number;
}

export default function RoomCard({ chambre, dateArrivee, dateDepart, index = 0 }: RoomCardProps) {
  const typeLabels: Record<string, string> = {
    SIMPLE: "Chambre Simple", DOUBLE: "Chambre Double",
    SUITE: "Suite", PENTHOUSE: "Penthouse", FAMILIALE: "Familiale",
  };

  const params = new URLSearchParams();
  if (dateArrivee) params.set("dateArrivee", dateArrivee);
  if (dateDepart)  params.set("dateDepart", dateDepart);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden group cursor-pointer"
    >
      {/* Image placeholder */}
      <div className="relative h-52 overflow-hidden">
        {chambre.imageUrl ? (
          <img
            src={chambre.imageUrl}
            alt={`Chambre ${chambre.numero}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E1B18 0%, #2A2520 100%)" }}
          >
            <div className="text-center">
              <div className="font-display text-4xl text-gold-800 mb-1">{chambre.numero}</div>
              <div className="text-night-500 text-sm">{typeLabels[chambre.type] || chambre.type}</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/60 to-transparent" />

        {/* Type badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}
        >
          {typeLabels[chambre.type] || chambre.type}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
          <Star size={11} className="text-gold-400 fill-gold-400" />
          <span className="text-white text-xs">4.8</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-night-50 mb-1">
              Chambre {chambre.numero}
            </h3>
            <div className="flex items-center gap-1.5 text-night-400 text-sm">
              <Users size={13} />
              <span>Jusqu&apos;à {chambre.capacite} personne{chambre.capacite > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-semibold text-gold-400">
              {chambre.prixParNuit}€
            </div>
            <div className="text-night-500 text-xs">/ nuit</div>
          </div>
        </div>

        {chambre.description && (
          <p className="text-night-400 text-sm leading-relaxed mb-4 line-clamp-2">{chambre.description}</p>
        )}

        {/* Equipements */}
        {chambre.equipements && chambre.equipements.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            {chambre.equipements.slice(0, 4).map((eq) => {
              const Icon = equipmentIcons[eq.toLowerCase()] || Wifi;
              return (
                <div
                  key={eq}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-night-300"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Icon size={11} className="text-night-400" />
                  {eq}
                </div>
              );
            })}
          </div>
        )}

        <Link
          href={`/rooms/${chambre.id}?${params}`}
          className="btn-gold w-full justify-center py-3 text-sm group"
        >
          Voir & Réserver
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
