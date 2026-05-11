"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Train, Plane, Bus, Ship, MapPin, Clock, Users, ArrowRight, Filter, Calendar } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { trajetApi } from "@/lib/api";
import type { Trajet, PageResponse } from "@/types";
import toast from "react-hot-toast";

const TRANSPORT_ICONS = { TRAIN: Train, AVION: Plane, BUS: Bus, BATEAU: Ship };
const TRANSPORT_LABELS = { TRAIN: "Train", AVION: "Avion", BUS: "Bus", BATEAU: "Bateau" };

export default function TransportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState({
    depart:  searchParams.get("depart") || "",
    arrivee: searchParams.get("arrivee") || "",
    date:    searchParams.get("date") || "",
    places:  Number(searchParams.get("places") || 1),
    type:    "Tous",
  });

  const fetchTrajets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { 
        places: search.places,
        page: page,
        size: 10
      };
      if (search.depart)  params.depart  = search.depart;
      if (search.arrivee) params.arrivee = search.arrivee;
      if (search.date)    params.date    = search.date;
      
      const { data } = await trajetApi.get(params);
      const pageData = data as PageResponse<Trajet>;
      setTrajets(pageData.content);
      setTotalPages(pageData.totalPages);
    } catch (error) {
      console.error("Error fetching trajets:", error);
      toast.error("Erreur chargement des trajets");
      setTrajets([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [search.depart, search.arrivee, search.date, search.places, page]);

  useEffect(() => { 
    fetchTrajets(); 
  }, [fetchTrajets]);

  const handleReserve = (trajet: Trajet) => {
    router.push(`/transport/${trajet.id}?places=${search.places}`);
  };

  const filtered = search.type === "Tous"
    ? trajets
    : trajets.filter(t => t.typeTransport === search.type);

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Voyagez en</p>
          <h1 className="font-display text-5xl font-light text-night-50 mb-4">
            Nos <span className="gold-text font-semibold">Transports</span>
          </h1>
          <p className="text-night-400">{trajets.length} trajet(s) disponible(s)</p>
        </motion.div>

        {/* Search bar inline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
              <input
                type="text"
                placeholder="Ville de départ"
                className="input-gold pl-8 text-sm py-2.5 w-full"
                value={search.depart}
                onChange={e => setSearch(s => ({ ...s, depart: e.target.value }))}
              />
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
              <input
                type="text"
                placeholder="Ville d'arrivée"
                className="input-gold pl-8 text-sm py-2.5 w-full"
                value={search.arrivee}
                onChange={e => setSearch(s => ({ ...s, arrivee: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
              <input
                type="date"
                placeholder="Date"
                className="input-gold pl-8 text-sm py-2.5 w-full"
                value={search.date}
                onChange={e => setSearch(s => ({ ...s, date: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
              <input 
                type="number" 
                min={1} 
                placeholder="Places" 
                className="input-gold pl-8 text-sm py-2.5 w-full"
                value={search.places}
                onChange={e => setSearch(s => ({ ...s, places: Number(e.target.value) }))} 
              />
            </div>
            <button 
              onClick={() => { setPage(0); fetchTrajets(); }} 
              className="btn-gold py-2.5 justify-center text-sm"
            >
              <Filter size={14} /> Filtrer
            </button>
          </div>
        </motion.div>

        {/* Type filter chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["Tous", "TRAIN", "AVION", "BUS", "BATEAU"].map(t => {
            const Icon = t === "Tous" ? Filter : TRANSPORT_ICONS[t as keyof typeof TRANSPORT_ICONS];
            return (
              <button 
                key={t} 
                onClick={() => setSearch(s => ({ ...s, type: t }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                  search.type === t
                    ? "bg-gold-500/20 border-gold-500/50 text-gold-300"
                    : "border-night-700 text-night-400 hover:border-night-500"
                }`}
              >
                <Icon size={14} />
                {t === "Tous" ? "Tous" : TRANSPORT_LABELS[t as keyof typeof TRANSPORT_LABELS]}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {filtered.map((t, i) => {
                const Icon = TRANSPORT_ICONS[t.typeTransport] || Train;
                const dateDepart = new Date(t.dateDepart);
                const dateArrivee = new Date(t.dateArrivee);
                const dureeMins = Math.round((dateArrivee.getTime() - dateDepart.getTime()) / 60000);
                const heures = Math.floor(dureeMins / 60);
                const mins = dureeMins % 60;

                return (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card glass-card-hover p-6 flex items-center gap-6 flex-wrap"
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <Icon size={24} className="text-gold-400" />
                    </div>

                    {/* Route */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-night-100 font-semibold text-lg">{t.lieuDepart}</span>
                        <ArrowRight size={16} className="text-gold-600 flex-shrink-0" />
                        <span className="text-night-100 font-semibold text-lg">{t.lieuArrivee}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}>
                          {TRANSPORT_LABELS[t.typeTransport]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-night-400 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {format(dateDepart, "HH:mm")} → {format(dateArrivee, "HH:mm")}
                        </span>
                        <span>{heures}h{mins > 0 ? ` ${mins}min` : ""}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(dateDepart, "dd/MM/yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {t.placesDisponibles} place{t.placesDisponibles > 1 ? "s" : ""} dispo
                        </span>
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-3xl text-gold-400 font-semibold mb-0.5">
                        {t.prixParPlace}€
                      </div>
                      <div className="text-night-500 text-xs mb-3">par personne</div>
                      <button
                        onClick={() => handleReserve(t)}
                        className={`btn-gold py-2 px-5 text-sm ${(t.placesDisponibles < search.places) && "opacity-50 cursor-not-allowed"}`}
                        disabled={t.placesDisponibles < search.places}
                      >
                        Réserver <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <Train size={40} className="text-night-700 mx-auto mb-4" />
                  <p className="text-night-400">Aucun trajet trouvé pour ces critères.</p>
                  <button 
                    onClick={() => {
                      setSearch({ depart: "", arrivee: "", date: "", places: 1, type: "Tous" });
                      setPage(0);
                      fetchTrajets();
                    }} 
                    className="btn-gold mt-4"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
  );
}