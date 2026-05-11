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
  TrendingUp,
  Armchair,
  ChevronRight,
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
  TRAIN: "Train",
  AVION: "Avion",
  BUS: "Bus",
  BATEAU: "Bateau",
};

const TRANSPORT_COLORS = {
  TRAIN: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600" },
  AVION: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", icon: "text-sky-600" },
  BUS: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600" },
  BATEAU: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-600" },
};

export default function TransportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allTrajets, setAllTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState({
    depart: searchParams.get("depart") || "",
    arrivee: searchParams.get("arrivee") || "",
    date: searchParams.get("date") || "",
    places: Number(searchParams.get("places") || 1),
    type: "Tous",
  });

  // ─── FETCH ALL DATA ─────────────────────────────────────────────
  const fetchTrajets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await trajetApi.get({ page, size: 50 }); // fetch more for client filtering
      console.log("API response:", response.data);

      const data = response.data;
      
      if (data && Array.isArray(data.content)) {
        setAllTrajets(data.content);
        setTotalPages(data.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        setAllTrajets(data);
        setTotalPages(1);
      } else {
        setAllTrajets([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching trajets:", error);
      toast.error("Erreur lors du chargement des trajets");
      setAllTrajets([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTrajets();
  }, [fetchTrajets]);

  const handleReserve = (trajet: Trajet) => {
    router.push(`/transport/${trajet.id}?places=${search.places}`);
  };

  // ─── CLIENT-SIDE FILTERING ──────────────────────────────────────
  const filtered = useMemo(() => {
    return allTrajets.filter((t) => {
      // Filter by transport type
      if (search.type !== "Tous" && t.typeTransport !== search.type) {
        return false;
      }

      // Filter by depart (case-insensitive partial match)
      if (search.depart) {
        const departLower = search.depart.toLowerCase().trim();
        if (!t.lieuDepart.toLowerCase().includes(departLower)) {
          return false;
        }
      }

      // Filter by arrivee (case-insensitive partial match)
      if (search.arrivee) {
        const arriveeLower = search.arrivee.toLowerCase().trim();
        if (!t.lieuArrivee.toLowerCase().includes(arriveeLower)) {
          return false;
        }
      }

      // Filter by date (same day)
      if (search.date) {
        const trajetDate = new Date(t.dateDepart);
        const filterDate = parseISO(search.date);
        if (!isSameDay(trajetDate, filterDate)) {
          return false;
        }
      }

      // Filter by places availability
      if (t.placesDisponibles < search.places) {
        return false;
      }

      return true;
    });
  }, [allTrajets, search]);

  const hasActiveSearch = search.depart || search.arrivee || search.date;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-amber-100/25 blur-[100px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-sky-50/40 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">
              Voyagez en toute sérénité
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-stone-900 mb-4 leading-tight">
              Nos <span className="italic text-amber-800">Transports</span>
            </h1>
            <p className="text-stone-500 text-lg">
              {loading
                ? "Chargement..."
                : `${filtered.length} trajet${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm shadow-stone-900/3 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                {/* Départ */}
                <div className="relative group">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200">
                    <MapPin size={16} className="text-amber-700 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Départ
                      </span>
                      <input
                        type="text"
                        placeholder="Ville de départ"
                        className="bg-transparent text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                        value={search.depart}
                        onChange={(e) =>
                          setSearch((s) => ({ ...s, depart: e.target.value }))
                        }
                      />
                    </div>
                    {search.depart && (
                      <button
                        onClick={() => setSearch((s) => ({ ...s, depart: "" }))}
                        className="shrink-0 text-stone-400 hover:text-stone-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Arrivée */}
                <div className="relative group">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200">
                    <MapPin size={16} className="text-amber-700 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Arrivée
                      </span>
                      <input
                        type="text"
                        placeholder="Ville d'arrivée"
                        className="bg-transparent text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                        value={search.arrivee}
                        onChange={(e) =>
                          setSearch((s) => ({ ...s, arrivee: e.target.value }))
                        }
                      />
                    </div>
                    {search.arrivee && (
                      <button
                        onClick={() => setSearch((s) => ({ ...s, arrivee: "" }))}
                        className="shrink-0 text-stone-400 hover:text-stone-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="relative group">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200">
                    <Calendar size={16} className="text-amber-700 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Date
                      </span>
                      <input
                        type="date"
                        className="bg-transparent text-sm font-medium text-stone-800 focus:outline-none w-full"
                        value={search.date}
                        onChange={(e) =>
                          setSearch((s) => ({ ...s, date: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Passagers */}
                <div className="relative group">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200">
                    <Users size={16} className="text-amber-700 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Passagers
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="bg-transparent text-sm font-medium text-stone-800 focus:outline-none w-full"
                        value={search.places}
                        onChange={(e) =>
                          setSearch((s) => ({
                            ...s,
                            places: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setPage(0)}
                  className="h-full min-h-[52px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
                >
                  <Search size={16} />
                  Rechercher
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Type filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {["Tous", "TRAIN", "AVION", "BUS", "BATEAU"].map((t) => {
            const Icon = t === "Tous" ? Filter : TRANSPORT_ICONS[t as keyof typeof TRANSPORT_ICONS];
            const colors = t !== "Tous" ? TRANSPORT_COLORS[t as keyof typeof TRANSPORT_COLORS] : null;
            const isActive = search.type === t;

            return (
              <button
                key={t}
                onClick={() => setSearch((s) => ({ ...s, type: t }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isActive
                    ? "bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/10"
                    : colors
                    ? `${colors.bg} ${colors.border} ${colors.text} hover:shadow-sm`
                    : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <Icon size={15} className={isActive ? "text-white" : colors?.icon || "text-stone-500"} />
                {t === "Tous" ? "Tous" : TRANSPORT_LABELS[t as keyof typeof TRANSPORT_LABELS]}
              </button>
            );
          })}
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-stone-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-stone-200 rounded animate-pulse w-1/2" />
                </div>
                <div className="w-24 h-8 bg-stone-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${search.type}-${page}-${search.depart}-${search.arrivee}-${search.date}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filtered.map((t, i) => {
                const Icon = TRANSPORT_ICONS[t.typeTransport] || Train;
                const colors = TRANSPORT_COLORS[t.typeTransport] || TRANSPORT_COLORS.TRAIN;

                const dateDepart = new Date(t.dateDepart);
                const dateArrivee = new Date(t.dateArrivee);
                const dureeMins = Math.round(
                  (dateArrivee.getTime() - dateDepart.getTime()) / 60000
                );
                const heures = Math.floor(dureeMins / 60);
                const mins = dureeMins % 60;

                const isFull = t.placesDisponibles < search.places;

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group bg-white rounded-2xl border border-stone-200/80 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
                  >
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg} border ${colors.border}`}
                    >
                      <Icon size={24} className={colors.icon} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Route */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-stone-900 font-semibold text-lg">
                          {t.lieuDepart}
                        </span>
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <div className="w-8 h-px bg-stone-300" />
                          <ArrowRight size={14} className="text-stone-400" />
                          <div className="w-8 h-px bg-stone-300" />
                        </div>
                        <span className="text-stone-900 font-semibold text-lg">
                          {t.lieuArrivee}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}
                        >
                          {TRANSPORT_LABELS[t.typeTransport]}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-stone-500 text-sm flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          <span className="font-medium text-stone-700">
                            {format(dateDepart, "HH:mm")}
                          </span>
                          <span className="text-stone-300">→</span>
                          <span className="font-medium text-stone-700">
                            {format(dateArrivee, "HH:mm")}
                          </span>
                          <span className="text-stone-400 ml-1">
                            ({heures}h{mins > 0 ? ` ${mins}min` : ""})
                          </span>
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {format(dateDepart, "EEEE d MMMM yyyy", { locale: fr })}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Armchair size={13} />
                          <span className={t.placesDisponibles < 5 ? "text-amber-600 font-medium" : ""}>
                            {t.placesDisponibles} place{t.placesDisponibles > 1 ? "s" : ""}
                          </span>
                          {t.placesDisponibles < 5 && (
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Bientôt complet
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 w-full md:w-auto shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-serif font-semibold text-stone-900">
                          {Number(t.prixParPlace).toFixed(2)}€
                        </div>
                        <div className="text-stone-400 text-xs">par personne</div>
                      </div>

                      <button
                        onClick={() => handleReserve(t)}
                        disabled={isFull}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isFull
                            ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                            : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
                        }`}
                      >
                        {isFull ? "Complet" : "Réserver"}
                        {!isFull && <ChevronRight size={14} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-stone-200 p-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={24} className="text-stone-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    Aucun trajet trouvé
                  </h3>
                  <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                    {allTrajets.length === 0
                      ? "Aucun trajet n'est disponible pour le moment."
                      : "Aucun trajet ne correspond à vos critères de recherche."}
                  </p>
                  {allTrajets.length > 0 && (
                    <button
                      onClick={() => {
                        setSearch({
                          depart: "",
                          arrivee: "",
                          date: "",
                          places: 1,
                          type: "Tous",
                        });
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-800 rounded-xl font-medium text-sm border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <X size={14} />
                      Réinitialiser la recherche
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
                if (pageNum >= totalPages) pageNum = totalPages - 5 + i;
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
  );
}