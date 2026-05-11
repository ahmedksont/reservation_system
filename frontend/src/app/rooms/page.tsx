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
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
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
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-amber-100/30 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">
              Collection
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-stone-900 mb-4 leading-tight">
              Nos <span className="italic text-amber-800">Chambres</span>
            </h1>
            <p className="text-stone-500 text-lg max-w-xl">
              {loading
                ? "Chargement des disponibilités..."
                : `${rooms.length} chambre${rooms.length !== 1 ? "s" : ""} disponible${rooms.length !== 1 ? "s" : ""} selon vos critères`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SEARCH SUMMARY BAR ──────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {/* Quick filter pills */}
              {filters.dateArrivee && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-medium text-amber-800 shrink-0">
                  <Calendar size={12} />
                  {new Date(filters.dateArrivee).toLocaleDateString("fr-FR")}
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, dateArrivee: "" }))
                    }
                    className="ml-1 hover:text-amber-950"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filters.dateDepart && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-medium text-amber-800 shrink-0">
                  <Calendar size={12} />
                  {new Date(filters.dateDepart).toLocaleDateString("fr-FR")}
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, dateDepart: "" }))
                    }
                    className="ml-1 hover:text-amber-950"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filters.type !== "Tous" && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-medium text-amber-800 shrink-0">
                  <BedDouble size={12} />
                  {TYPE_LABELS[filters.type]}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, type: "Tous" }))}
                    className="ml-1 hover:text-amber-950"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filters.capacite > 1 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-medium text-amber-800 shrink-0">
                  <Users size={12} />
                  {filters.capacite} pers.
                  <button
                    onClick={() => setFilters((f) => ({ ...f, capacite: 1 }))}
                    className="ml-1 hover:text-amber-950"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {activeFiltersCount === 0 && !loading && (
                <span className="text-xs text-stone-400">
                  Aucun filtre actif
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-medium text-stone-700 hover:border-stone-300 transition-all"
                >
                  <ArrowUpDown size={14} />
                  {currentSortLabel}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-xl shadow-stone-900/5 overflow-hidden z-50"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-amber-50 text-amber-800 font-medium"
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

              {/* View toggle */}
              <div className="flex items-center bg-stone-100 rounded-xl p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    view === "grid"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-lg transition-all ${
                    view === "list"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium"
              >
                <SlidersHorizontal size={14} />
                Filtres
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── FILTERS SIDEBAR ─────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`lg:w-72 space-y-6 ${
              filtersOpen
                ? "fixed inset-0 z-40 bg-white p-4 overflow-y-auto lg:static lg:bg-transparent lg:p-0"
                : "hidden lg:block"
            }`}
          >
            {filtersOpen && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-xl font-serif font-semibold">Filtres</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-2 rounded-lg hover:bg-stone-100"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm shadow-stone-900/3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-amber-700" />
                  Filtres avancés
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-stone-400 hover:text-amber-700 transition-colors font-medium"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Type */}
              <div className="mb-8">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3 block">
                  Type de chambre
                </label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilters((f) => ({ ...f, type: t }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                        filters.type === t
                          ? "bg-amber-50 border-amber-300 text-amber-800"
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-8">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-4 block">
                  Fourchette de prix
                </label>
                <div className="px-1">
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={filters.prixMax}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        prixMax: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-amber-700"
                  />
                  <div className="flex justify-between mt-3 text-xs font-medium text-stone-500">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100">
                      {filters.prixMin}€
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800">
                      {filters.prixMax}€
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-stone-400">
                    <span>0€</span>
                    <span>1000€</span>
                    <span>2000€</span>
                  </div>
                </div>
              </div>

              {/* Capacité */}
              <div className="mb-8">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3 block">
                  Voyageurs
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        setFilters((f) => ({ ...f, capacite: n }))
                      }
                      className={`flex-1 h-11 rounded-xl text-sm font-medium border transition-all ${
                        filters.capacite === n
                          ? "bg-amber-50 border-amber-300 text-amber-800"
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
                    Arrivée
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                      value={filters.dateArrivee}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          dateArrivee: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
                    Départ
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                      value={filters.dateDepart}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          dateDepart: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Search size={14} />
                Appliquer les filtres
              </button>
            </div>
          </motion.aside>

          {/* ── ROOMS GRID ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div
                className={`grid ${
                  view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                } gap-6`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
                  >
                    <div className="aspect-[4/3] bg-stone-200 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-stone-200 rounded animate-pulse w-1/2" />
                      <div className="h-8 bg-stone-200 rounded animate-pulse w-1/3 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filters.type}-${page}-${sortBy}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className={`grid ${
                    view === "grid"
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  } gap-6`}
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
                className="bg-white rounded-2xl border border-stone-200 p-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  Aucune chambre trouvée
                </h3>
                <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
                  Aucune chambre ne correspond à vos critères actuels. Essayez
                  d'élargir votre recherche ou de modifier les filtres.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-800 rounded-xl font-medium text-sm border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <X size={14} />
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && rooms.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${
                    page === 0
                      ? "border-stone-200 text-stone-300 cursor-not-allowed"
                      : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  ‹
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum = i;
                  if (totalPages > 5 && page > 2) {
                    pageNum = page - 2 + i;
                    if (pageNum >= totalPages)
                      pageNum = totalPages - 5 + i;
                  }
                  if (pageNum >= 0 && pageNum < totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${
                          page === pageNum
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page === totalPages - 1}
                  className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${
                    page === totalPages - 1
                      ? "border-stone-200 text-stone-300 cursor-not-allowed"
                      : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}