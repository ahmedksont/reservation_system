"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { format, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Train,
  Plane,
  Bus,
  Ship,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Filter,
  Calendar,
  Search,
  X,
  ChevronRight,
  Navigation,
  Globe,
  Wind,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { trajetApi } from "@/lib/api";
import type { Trajet } from "@/types";
import toast from "react-hot-toast";

const TRANSPORT_ICONS = {
  TRAIN: Train,
  AVION: Plane,
  BUS: Bus,
  BATEAU: Ship,
};

const TRANSPORT_LABELS = {
  TRAIN: "Chemin de Fer",
  AVION: "Lignes Aériennes",
  BUS: "Transport Routier",
  BATEAU: "Lignes Maritimes",
};

const TRANSPORT_META = {
  TRAIN: { label: "Rail Premium", detail: "Confort & Vitesse" },
  AVION: { label: "First Class", detail: "L'excellence en vol" },
  BUS: { label: "Business Class", detail: "Luxe & Mobilité" },
  BATEAU: { label: "Grand Voyage", detail: "Sérénité en mer" },
};

export default function TransportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allTrajets, setAllTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState({
    depart: searchParams.get("depart") || "",
    arrivee: searchParams.get("arrivee") || "",
    date: searchParams.get("date") || "",
    places: Number(searchParams.get("places") || 1),
    type: "Tous",
  });

  const fetchTrajets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await trajetApi.get({ page, size: 50 });
      const data = response.data;
      if (data && Array.isArray(data.content)) {
        setAllTrajets(data.content);
      } else if (Array.isArray(data)) {
        setAllTrajets(data);
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTrajets();
  }, [fetchTrajets]);

  const filtered = useMemo(() => {
    return allTrajets.filter((t) => {
      if (search.type !== "Tous" && t.typeTransport !== search.type) return false;
      if (search.depart && !t.lieuDepart.toLowerCase().includes(search.depart.toLowerCase())) return false;
      if (search.arrivee && !t.lieuArrivee.toLowerCase().includes(search.arrivee.toLowerCase())) return false;
      if (search.date && !isSameDay(new Date(t.dateDepart), parseISO(search.date))) return false;
      if (t.placesDisponibles < search.places) return false;
      return true;
    });
  }, [allTrajets, search]);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1C1917]">
      <Navbar />

      {/* ── LUXURY HEADER ───────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-50 rounded-full blur-[120px] opacity-40 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-100 rounded-full blur-[100px] opacity-30 -ml-20 -mb-20" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-amber-800">
              <Globe size={12} />
              Évasion Exclusive
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight text-stone-900">
              L&apos;Art du <span className="italic text-amber-800 underline decoration-amber-100 underline-offset-8">Mouvement</span>
            </h1>
            <p className="max-w-2xl mx-auto text-stone-400 font-medium text-lg leading-relaxed">
              Découvrez notre sélection de trajets d&apos;exception. Des liaisons aériennes privées aux transferts routiers business class, voyagez avec distinction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SEARCH DASHBOARD ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 -mt-4 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-stone-100 p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-stone-50 border border-transparent hover:border-stone-200 transition-all group">
              <MapPin size={18} className="text-amber-800" />
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Origine</p>
                <input 
                  type="text" 
                  placeholder="D&apos;où partez-vous ?"
                  className="bg-transparent w-full text-sm font-bold text-stone-900 focus:outline-none placeholder:text-stone-300"
                  value={search.depart}
                  onChange={(e) => setSearch(s => ({ ...s, depart: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-stone-50 border border-transparent hover:border-stone-200 transition-all">
              <Navigation size={18} className="text-amber-800 rotate-45" />
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Destination</p>
                <input 
                  type="text" 
                  placeholder="Où allez-vous ?"
                  className="bg-transparent w-full text-sm font-bold text-stone-900 focus:outline-none placeholder:text-stone-300"
                  value={search.arrivee}
                  onChange={(e) => setSearch(s => ({ ...s, arrivee: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-stone-50 border border-transparent hover:border-stone-200 transition-all">
              <Calendar size={18} className="text-amber-800" />
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Date</p>
                <input 
                  type="date"
                  className="bg-transparent w-full text-sm font-bold text-stone-900 focus:outline-none"
                  value={search.date}
                  onChange={(e) => setSearch(s => ({ ...s, date: e.target.value }))}
                />
              </div>
            </div>

            <button className="bg-stone-900 text-white rounded-2xl py-4 px-8 font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-800 transition-all shadow-xl shadow-stone-900/10 flex items-center justify-center gap-3 active:scale-[0.98]">
              <Search size={16} />
              Rechercher
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── FILTER TABS ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {["Tous", "TRAIN", "AVION", "BUS", "BATEAU"].map((t) => {
            const isActive = search.type === t;
            return (
              <button
                key={t}
                onClick={() => setSearch(s => ({ ...s, type: t }))}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  isActive 
                    ? "bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-900/20" 
                    : "bg-white text-stone-400 border-stone-100 hover:border-amber-200 hover:text-amber-800"
                }`}
              >
                {t === "Tous" ? "Toutes les lignes" : TRANSPORT_LABELS[t as keyof typeof TRANSPORT_LABELS]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TRANSPORT LISTING ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, i) => {
              const Icon = TRANSPORT_ICONS[t.typeTransport] || Train;
              const meta = TRANSPORT_META[t.typeTransport] || TRANSPORT_META.TRAIN;
              const dateDepart = new Date(t.dateDepart);
              const dateArrivee = new Date(t.dateArrivee);
              
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  onClick={() => router.push(`/transport/${t.id}?places=${search.places}`)}
                  className="group relative bg-white rounded-[2.5rem] border border-stone-100 p-8 cursor-pointer hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] hover:border-amber-100 transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-900 group-hover:bg-amber-800 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold text-stone-900">{meta.label}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">{meta.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">À partir de</p>
                      <p className="text-3xl font-serif font-light text-stone-900">{t.prixParPlace.toFixed(0)}<span className="text-base italic text-amber-800">€</span></p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between gap-6 mb-12">
                    <div className="text-left flex-1">
                      <p className="text-3xl font-serif font-bold text-stone-900">{format(dateDepart, "HH:mm")}</p>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest truncate">{t.lieuDepart}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-2 relative">
                      <div className="w-full h-[2px] bg-stone-50 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
                        <div className="w-8 h-8 rounded-full bg-white border border-stone-50 flex items-center justify-center z-10 shadow-sm group-hover:rotate-[360deg] transition-transform duration-1000">
                          <Wind size={14} className="text-amber-800" />
                        </div>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">Direct Voyage</p>
                    </div>

                    <div className="text-right flex-1">
                      <p className="text-3xl font-serif font-bold text-stone-900">{format(dateArrivee, "HH:mm")}</p>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest truncate">{t.lieuArrivee}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-dashed border-stone-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-stone-400">
                        <Users size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.placesDisponibles} places</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Temps réel</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-800 group-hover:translate-x-2 transition-transform">
                      <span className="text-[10px] font-black uppercase tracking-widest">Réserver</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-stone-200" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2">Aucun itinéraire trouvé</h3>
            <p className="text-stone-400 max-w-sm mx-auto">Veuillez ajuster vos critères de recherche pour découvrir d&apos;autres destinations.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}