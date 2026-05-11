"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Grid, List, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import RoomCard from "@/components/cards/RoomCard";
import { chambreApi } from "@/lib/api";
import type { Chambre, PageResponse } from "@/types";

const TYPES = ["Tous", "SIMPLE", "DOUBLE", "SUITE", "PENTHOUSE", "FAMILIALE"];
const TYPE_LABELS: Record<string, string> = {
  Tous: "Tous", SIMPLE: "Simple", DOUBLE: "Double", SUITE: "Suite",
  PENTHOUSE: "Penthouse", FAMILIALE: "Familiale",
};

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("prix_croissant");
  const [filters, setFilters] = useState({
    type: "Tous",
    prixMin: 0,
    prixMax: 2000,
    capacite: 1,
    dateArrivee: searchParams.get("dateArrivee") || "",
    dateDepart:  searchParams.get("dateDepart")  || "",
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
      if (filters.dateDepart)  params.dateDepart  = filters.dateDepart;
      
      // Add sorting
      if (sortBy === "prix_croissant") params.sort = "prixParNuit,asc";
      if (sortBy === "prix_decroissant") params.sort = "prixParNuit,desc";

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

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Collection</p>
          <h1 className="font-display text-5xl font-light text-night-50 mb-4">
            Nos <span className="gold-text font-semibold">Chambres</span>
          </h1>
          <p className="text-night-400 text-lg">
            {loading ? "Chargement..." : `${rooms.length} chambre${rooms.length !== 1 ? "s" : ""} disponible${rooms.length !== 1 ? "s" : ""}`}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-72 space-y-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-semibold text-night-100 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-gold-500" />
                  Filtres
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-night-500 hover:text-gold-400 transition"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Type */}
              <div className="mb-6">
                <label className="text-night-400 text-xs uppercase tracking-widest mb-3 block">Type de chambre</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilters(f => ({ ...f, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.type === t
                          ? "bg-gold-500/20 border border-gold-500/50 text-gold-300"
                          : "border border-night-700 text-night-400 hover:border-night-500"
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <label className="text-night-400 text-xs uppercase tracking-widest mb-3 block">
                  Prix / nuit: {filters.prixMin}€ — {filters.prixMax}€
                </label>
                <div className="space-y-2">
                  <div className="flex gap-4 text-sm">
                    <span className="text-night-500">Min: {filters.prixMin}€</span>
                    <span className="text-night-500">Max: {filters.prixMax}€</span>
                  </div>
                  <input
                    type="range" 
                    min={0} 
                    max={2000} 
                    step={50}
                    value={filters.prixMax}
                    onChange={e => setFilters(f => ({ ...f, prixMax: Number(e.target.value) }))}
                    className="w-full accent-gold-500"
                  />
                  <div className="flex justify-between text-xs text-night-600">
                    <span>0€</span>
                    <span>500€</span>
                    <span>1000€</span>
                    <span>1500€</span>
                    <span>2000€</span>
                  </div>
                </div>
              </div>

              {/* Capacité */}
              <div className="mb-6">
                <label className="text-night-400 text-xs uppercase tracking-widest mb-3 block">Personnes min.</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setFilters(f => ({ ...f, capacite: n }))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all ${
                        filters.capacite === n
                          ? "bg-gold-500/20 border-gold-500/50 text-gold-300"
                          : "border-night-700 text-night-400 hover:border-night-500"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div>
                  <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Arrivée</label>
                  <input 
                    type="date" 
                    className="input-gold text-sm w-full" 
                    value={filters.dateArrivee}
                    onChange={e => setFilters(f => ({ ...f, dateArrivee: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Départ</label>
                  <input 
                    type="date" 
                    className="input-gold text-sm w-full" 
                    value={filters.dateDepart}
                    onChange={e => setFilters(f => ({ ...f, dateDepart: e.target.value }))} 
                  />
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                className="btn-gold w-full justify-center mt-5"
              >
                Appliquer les filtres
              </button>
            </div>
          </motion.aside>

          {/* Main grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-lg border transition-all ${view === "grid" ? "border-gold-500/50 text-gold-400" : "border-night-700 text-night-500 hover:text-night-300"}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-lg border transition-all ${view === "list" ? "border-gold-500/50 text-gold-400" : "border-night-700 text-night-500 hover:text-night-300"}`}
                >
                  <List size={16} />
                </button>
              </div>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-gold w-auto text-sm py-2"
              >
                <option value="prix_croissant">Prix croissant</option>
                <option value="prix_decroissant">Prix décroissant</option>
              </select>
            </div>

            {/* Rooms grid */}
            {loading ? (
              <div className={`grid ${view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"} gap-6`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-2xl" />
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filters.type}-${page}-${sortBy}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`grid ${view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"} gap-6`}
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
              <div className="glass-card p-12 text-center">
                <p className="text-night-400 text-lg mb-4">Aucune chambre disponible pour ces critères</p>
                <button onClick={handleResetFilters} className="btn-gold">
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && rooms.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                    page === 0
                      ? "border-night-700 text-night-600 cursor-not-allowed"
                      : "border-night-700 text-night-400 hover:border-night-500"
                  }`}
                >
                  «
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum = i;
                  if (totalPages > 5 && page > 2) {
                    pageNum = page - 2 + i;
                    if (pageNum >= totalPages) pageNum = totalPages - 5 + i;
                  }
                  if (pageNum >= 0 && pageNum < totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                          page === pageNum
                            ? "bg-gold-500/20 border-gold-500/50 text-gold-400"
                            : "border-night-700 text-night-400 hover:border-night-500"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                    page === totalPages - 1
                      ? "border-night-700 text-night-600 cursor-not-allowed"
                      : "border-night-700 text-night-400 hover:border-night-500"
                  }`}
                >
                  »
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}