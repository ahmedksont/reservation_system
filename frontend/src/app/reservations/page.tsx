"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Hotel,
  Train,
  CreditCard,
  X,
  Eye,
  ArrowRight,
  ChevronRight,
  Bed,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Ban,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { reservationApi } from "@/lib/api";
import type { Reservation, PageResponse } from "@/types";
import toast from "react-hot-toast";

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: "En attente",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
  },
  CONFIRMEE: {
    label: "Confirmée",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  ANNULEE: {
    label: "Annulée",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: Ban,
  },
  TERMINEE: {
    label: "Terminée",
    bg: "bg-stone-100",
    border: "border-stone-200",
    text: "text-stone-600",
    icon: CheckCircle2,
  },
} as const;

const PAIEMENT_CONFIG = {
  EN_ATTENTE: {
    label: "Non payé",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  PAYE: {
    label: "Payé",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  REMBOURSE: {
    label: "Remboursé",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
  },
  ECHOUE: {
    label: "Échoué",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
} as const;

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [page]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data } = await reservationApi.getMes(page);
      const paged = data as PageResponse<Reservation>;
      setReservations(paged.content);
      setTotalPages(paged.totalPages);
    } catch {
      toast.error("Impossible de charger les réservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Confirmer l'annulation ? Un remboursement sera effectué si le paiement a été effectué.")) return;
    setCancelling(id);
    try {
      await reservationApi.cancel(id);
      toast.success("Réservation annulée avec succès");
      fetchReservations();
    } catch {
      toast.error("Impossible d'annuler cette réservation");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-amber-100/25 blur-[100px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-sky-50/40 blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">
              Mon espace
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 mb-4 leading-tight">
              Mes <span className="italic text-amber-800">Réservations</span>
            </h1>
            <p className="text-stone-500 text-lg">
              {loading
                ? "Chargement..."
                : `${reservations.length} réservation${reservations.length !== 1 ? "s" : ""}`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200/80 p-6 flex items-center gap-6"
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
        ) : reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Aucune réservation
            </h3>
            <p className="text-stone-500 text-sm mb-8 max-w-md mx-auto">
              Vous n&apos;avez pas encore effectué de réservation. Découvrez nos offres dès maintenant.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
              >
                <Hotel size={16} />
                Voir les hôtels
                <ChevronRight size={14} />
              </Link>
              <Link
                href="/transport"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-700 rounded-xl font-medium text-sm border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all active:scale-[0.98]"
              >
                <Train size={16} />
                Voir les transports
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {reservations.map((r, i) => {
                const statutCfg = STATUT_CONFIG[r.statut];
                const paiementCfg = PAIEMENT_CONFIG[r.statutPaiement];
                const canCancel = r.statut === "EN_ATTENTE" || r.statut === "CONFIRMEE";
                const StatutIcon = statutCfg.icon;
                const isHotel = r.lignes.some((l) => l.chambre);

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group bg-white rounded-2xl border border-stone-200/80 p-5 md:p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-amber-50 border border-amber-200`}>
                          {isHotel ? (
                            <Bed size={24} className="text-amber-600" />
                          ) : (
                            <Train size={24} className="text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">
                            Réservation
                          </p>
                          <p className="text-stone-900 font-semibold font-mono text-lg">
                            #{r.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-stone-500 text-xs mt-1 flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(r.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${statutCfg.bg} ${statutCfg.text} ${statutCfg.border}`}
                        >
                          <StatutIcon size={10} />
                          {statutCfg.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${paiementCfg.bg} ${paiementCfg.text} ${paiementCfg.border}`}
                        >
                          {paiementCfg.label}
                        </span>
                        <span className="font-serif text-xl font-semibold text-stone-900 ml-2">
                          {r.montantTotal.toFixed(2)}€
                        </span>
                      </div>
                    </div>

                    {/* Lignes */}
                    <div className="py-4 border-t border-stone-100 space-y-3">
                      {r.lignes.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between text-sm p-3 rounded-xl bg-stone-50 border border-stone-100"
                        >
                          <div className="flex items-center gap-2 text-stone-700">
                            {l.chambre ? (
                              <>
                                <Bed size={14} className="text-stone-400 shrink-0" />
                                <span>
                                  Chambre {l.chambre.numero} ·{" "}
                                  <span className="text-stone-500">
                                    {l.dateArrivee} → {l.dateDepart}
                                  </span>
                                </span>
                              </>
                            ) : l.trajet ? (
                              <>
                                <MapPin size={14} className="text-stone-400 shrink-0" />
                                <span>
                                  {l.trajet.lieuDepart} → {l.trajet.lieuArrivee}
                                  <span className="text-stone-500 ml-1">
                                    ({l.nombrePlaces} place{(l.nombrePlaces || 0) > 1 ? "s" : ""})
                                  </span>
                                </span>
                              </>
                            ) : (
                              <span className="text-stone-400">—</span>
                            )}
                          </div>
                          <span className="text-stone-900 font-medium tabular-nums">
                            {l.prixTotal.toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-stone-100 flex items-center gap-3 flex-wrap">
                      {r.statutPaiement === "EN_ATTENTE" && r.stripePaymentIntentId && (
                        <Link
                          href={`/payment/${r.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all active:scale-[0.98]"
                        >
                          <CreditCard size={14} />
                          Payer maintenant
                          <ChevronRight size={12} />
                        </Link>
                      )}
                      <Link
                        href={`/reservations/${r.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]"
                      >
                        <Eye size={14} />
                        Détails
                      </Link>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancelling === r.id}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          <X size={14} />
                          {cancelling === r.id ? "Annulation..." : "Annuler"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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