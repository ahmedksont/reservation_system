"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RoomCard from "@/components/cards/RoomCard";
import type { Chambre } from "@/types";

const FEATURED: Chambre[] = [
  {
    id: "f1",
    numero: "301",
    type: "SUITE",
    prixParNuit: 299,
    description: "Suite luxueuse avec salon séparé, jacuzzi et vue panoramique",
    capacite: 2,
    disponible: true,
    equipements: ["wifi", "bain", "café"],
    etage: 3,
  },
  {
    id: "f2",
    numero: "402",
    type: "PENTHOUSE",
    prixParNuit: 599,
    description: "Penthouse exclusif avec terrasse privée sur les toits",
    capacite: 4,
    disponible: true,
    equipements: ["wifi", "bain", "café", "climatisation"],
    etage: 4,
  },
  {
    id: "f3",
    numero: "205",
    type: "DOUBLE",
    prixParNuit: 149,
    description: "Chambre double élégante avec lit king size et dressing",
    capacite: 2,
    disponible: true,
    equipements: ["wifi", "climatisation"],
    etage: 2,
  },
];

export default function FeaturedRooms() {
  return (
    <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">
            Notre sélection
          </p>
          <h2 className="font-display text-5xl font-light text-night-50">
            Chambres{" "}
            <span className="gold-text font-semibold">vedettes</span>
          </h2>
        </div>
        <Link
          href="/rooms"
          className="hidden md:flex btn-ghost items-center gap-2 text-sm"
        >
          Tout voir <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURED.map((room, i) => (
          <RoomCard key={room.id} chambre={room} index={i} />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/rooms" className="btn-ghost">
          Voir toutes les chambres <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
