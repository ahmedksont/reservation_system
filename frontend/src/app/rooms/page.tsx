"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  X,
  Search,
  ArrowUpDown,
  Star,
  BedDouble,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RoomCard from "@/components/cards/RoomCard";
import { chambreApi } from "@/lib/api";
import type { Chambre, PageResponse } from "@/types";

const TYPES = ["Tous", "SIMPLE", "DOUBLE", "SUITE", "PENTHOUSE", "FAMILIALE"];
const TYPE_LABELS: Record<string, string> = {
  Tous: "Tous",
  SIMPLE: "Simple",
  DOUBLE: "Double",
  SUITE: "Suite",
  PENTHOUSE: "Penthouse",
  FAMILIALE: "Familiale",
};

const SORT_OPTIONS = [
  { value: "prix_croissant", label: "Prix croissant" },
  { value: "prix_decroissant", label: "Prix décroissant" },
  { value: "note_decroissante", label: "Meilleures notes" },
  { value: "capacite_croissante", label: "Capacité" },
];

const COLLECTIONS = [
  { id: "oasis", name: "L'Oasis de Paix", location: "Marrakech, Maroc", rooms: 12, image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=1000" },
  { id: "azur", name: "Le Rivage d'Azur", location: "Nice, France", rooms: 8, image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1000" },
  { id: "alpin", name: "Le Sommet Alpin", location: "Chamonix, France", rooms: 15, image: "https://images.unsplash.com/photo-1518005020251-58296d85127d?auto=format&fit=crop&q=80&w=1000" },
];

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("prix_croissant");
  const [filters, setFilters] = useState({
    type: "Tous",
    prixMin: 0,
    prixMax: 2000,
    capacite: 1,
    dateArrivee: searchParams.get("dateArrivee") || "",
    dateDepart: searchParams.get("dateDepart") || "",
  });

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        size: 12,
        prixMin: filters.prixMin,
        prixMax: filters.prixMax,
        capacite: filters.capacite,
      };
      if (filters.type !== "Tous") params.type = filters.type;
      if (filters.dateArrivee) params.dateArrivee = filters.dateArrivee;
      if (filters.dateDepart) params.dateDepart = filters.dateDepart;

      if (sortBy === "prix_croissant") params.sort = "prixParNuit,asc";
      if (sortBy === "prix_decroissant") params.sort = "prixParNuit,desc";
      if (sortBy === "note_decroissante") params.sort = "note,desc";
      if (sortBy === "capacite_croissante") params.sort = "capacite,asc";

      const { data } = await chambreApi.getDisponibles(params);
      const paged = data as PageResponse<Chambre>;
      setRooms(paged.content);
      setTotalPages(paged.totalPages);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, sortBy]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms, sortBy]);

  const handleApplyFilters = () => {
    setPage(0);
    fetchRooms();
    setFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      type: "Tous",
      prixMin: 0,
      prixMax: 2000,
      capacite: 1,
      dateArrivee: "",
      dateDepart: "",
    });
    setSortBy("prix_croissant");
    setPage(0);
  };

  const activeFiltersCount = [
    filters.type !== "Tous",
    filters.prixMin > 0 || filters.prixMax < 2000,
    filters.capacite > 1,
    filters.dateArrivee !== "",
    filters.dateDepart !== "",
  ].filter(Boolean).length;

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Trier par";

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-4 overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-40"
            alt="Luxury Hotel"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/40 to-stone-900" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-500 mb-6 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20"
            >
              <Zap size={14} className="animate-pulse" />
              Expériences d'Exception
            </motion.span>
            <h1 className="font-serif text-5xl md:text-7xl font-light mb-6 leading-[1.1]">
              Découvrez nos <br />
              <span className="italic text-amber-500 font-normal">Sanctuaires de Luxe</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light">
              Une collection curatée d'espaces conçus pour le confort ultime,
              où chaque détail raconte une histoire d'élégance et de sérénité.
            </p>

            <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <ShieldCheck size={20} className="text-amber-500" />
                </div>
                <span className="text-sm font-medium">Réservation Sécurisée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Star size={20} className="text-amber-500" />
                </div>
                <span className="text-sm font-medium">Services 5 Étoiles</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── COLLECTIONS SELECTOR ───────────────────────────────────── */}

      {/* ── SEARCH & FILTER BAR ────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 text-stone-900 text-sm font-semibold hover:bg-stone-200 transition-all border border-transparent hover:border-stone-300"
              >
                <SlidersHorizontal size={16} />
                Filtrer
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters((f) => ({ ...f, type: t }))}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filters.type === t
                        ? "bg-stone-900 text-white shadow-lg"
                        : "bg-white text-stone-500 hover:text-stone-900 border border-stone-200"
                      }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-stone-700 hover:border-stone-300 transition-all"
                >
                  <ArrowUpDown size={14} />
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-sm transition-colors ${sortBy === option.value
                              ? "bg-amber-50 text-amber-900 font-bold"
                              : "text-stone-600 hover:bg-stone-50"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-full transition-all ${view === "grid"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                    }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-full transition-all ${view === "list"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                    }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div
            className={`grid ${view === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
              } gap-8`}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-stone-100 animate-pulse" />
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-stone-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-stone-100 rounded animate-pulse w-1/2" />
                  <div className="pt-4 h-12 bg-stone-100 rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filters.type}-${page}-${sortBy}-${view}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`grid ${view === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
                } gap-8`}
            >
              {rooms.map((room, i) => (
                <RoomCard
                  key={room.id}
                  chambre={room}
                  dateArrivee={filters.dateArrivee}
                  dateDepart={filters.dateDepart}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-stone-200 p-20 text-center shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 border border-stone-100">
              <Search size={32} className="text-stone-300" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-3">
              Aucune chambre trouvée
            </h3>
            <p className="text-stone-500 mb-10 max-w-md mx-auto leading-relaxed">
              Nous n'avons pas trouvé de chambres correspondant à vos critères actuels.
              Essayez de modifier vos filtres ou vos dates.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-full font-bold text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && rooms.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-20">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center transition-all hover:bg-white hover:border-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="rotate-90" size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-12 h-12 rounded-full text-sm font-bold transition-all ${page === i
                    ? "bg-stone-900 text-white shadow-xl scale-110"
                    : "bg-white text-stone-400 border border-stone-100 hover:border-stone-300 hover:text-stone-900"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center transition-all hover:bg-white hover:border-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="-rotate-90" size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ── FILTER DRAWER (Mobile & Overlay) ───────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-serif text-2xl">Affiner la recherche</h2>
                <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full hover:bg-stone-100">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10">
                {/* Type */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4 block">Type de séjour</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters((f) => ({ ...f, type: t }))}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${filters.type === t
                            ? "bg-stone-900 border-stone-900 text-white shadow-lg"
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                          }`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4 block">Dates</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-stone-500">Arrivée</span>
                      <input
                        type="date"
                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-amber-500"
                        value={filters.dateArrivee}
                        onChange={(e) => setFilters(f => ({ ...f, dateArrivee: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-stone-500">Départ</span>
                      <input
                        type="date"
                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-amber-500"
                        value={filters.dateDepart}
                        onChange={(e) => setFilters(f => ({ ...f, dateDepart: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-6 block">Budget par nuit</label>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={filters.prixMax}
                    onChange={(e) => setFilters(f => ({ ...f, prixMax: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-stone-100 rounded-full appearance-none cursor-pointer accent-amber-600 mb-4"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-400">0€</span>
                    <span className="px-5 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-100">
                      Jusqu'à {filters.prixMax}€
                    </span>
                    <span className="text-sm font-bold text-stone-400">2000€</span>
                  </div>
                </div>

                {/* Voyageurs */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4 block">Nombre de personnes</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFilters(f => ({ ...f, capacite: n }))}
                        className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all border ${filters.capacite === n
                            ? "bg-stone-900 border-stone-900 text-white shadow-lg"
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <button
                  onClick={handleApplyFilters}
                  className="w-full py-5 bg-amber-600 text-white rounded-3xl font-bold text-sm hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98]"
                >
                  Appliquer les filtres
                </button>
                <button
                  onClick={handleResetFilters}
                  className="w-full py-4 text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-stone-900 transition-colors"
                >
                  Tout réinitialiser
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}