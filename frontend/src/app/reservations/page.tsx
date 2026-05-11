"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Hotel, Train, CreditCard, X, Eye, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { reservationApi } from "@/lib/api";
import type { Reservation, PageResponse } from "@/types";
import toast from "react-hot-toast";

const STATUT_CONFIG = {
  EN_ATTENTE:  { label: "En attente",  className: "badge-pending" },
  CONFIRMEE:   { label: "Confirmée",   className: "badge-confirmed" },
  ANNULEE:     { label: "Annulée",     className: "badge-cancelled" },
  TERMINEE:    { label: "Terminée",    className: "badge-paid" },
} as const;

const PAIEMENT_CONFIG = {
  EN_ATTENTE: { label: "Non payé",  className: "badge-pending" },
  PAYE:       { label: "Payé",      className: "badge-confirmed" },
  REMBOURSE:  { label: "Remboursé", className: "badge-paid" },
  ECHOUE:     { label: "Échoué",    className: "badge-cancelled" },
} as const;

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => { fetchReservations(); }, [page]);

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
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Mon espace</p>
          <h1 className="font-display text-5xl font-light text-night-50">
            Mes <span className="gold-text font-semibold">Réservations</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : reservations.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
            <Calendar size={48} className="text-night-700 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-night-300 mb-2">Aucune réservation</h3>
            <p className="text-night-500 mb-8">Vous n&apos;avez pas encore effectué de réservation.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/rooms" className="btn-gold">
                <Hotel size={16} /> Voir les hôtels
              </Link>
              <Link href="/transport" className="btn-ghost">
                <Train size={16} /> Voir les transports
              </Link>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {reservations.map((r, i) => {
                const statutCfg = STATUT_CONFIG[r.statut];
                const paiementCfg = PAIEMENT_CONFIG[r.statutPaiement];
                const canCancel = r.statut === "EN_ATTENTE" || r.statut === "CONFIRMEE";

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                          {r.lignes.some(l => l.chambre) ? (
                            <Hotel size={20} className="text-gold-400" />
                          ) : (
                            <Train size={20} className="text-gold-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-night-500 text-xs mb-0.5">Réservation</p>
                          <p className="text-night-100 font-semibold font-mono">#{r.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-night-500 text-xs mt-1">
                            {format(new Date(r.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statutCfg.className}`}>
                          {statutCfg.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${paiementCfg.className}`}>
                          {paiementCfg.label}
                        </span>
                        <span className="font-display text-xl text-gold-400 font-semibold">
                          {r.montantTotal.toFixed(2)}€
                        </span>
                      </div>
                    </div>

                    {/* Lignes */}
                    <div className="mt-4 pt-4 border-t border-night-800/60 space-y-2">
                      {r.lignes.map(l => (
                        <div key={l.id} className="flex items-center justify-between text-sm">
                          <span className="text-night-300">
                            {l.chambre
                              ? `Chambre ${l.chambre.numero} · ${l.dateArrivee} → ${l.dateDepart}`
                              : l.trajet
                                ? `${l.trajet.lieuDepart} → ${l.trajet.lieuArrivee} (${l.nombrePlaces} place${(l.nombrePlaces||0)>1?"s":""})`
                                : "—"
                            }
                          </span>
                          <span className="text-night-400">{l.prixTotal.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-3">
                      {r.statutPaiement === "EN_ATTENTE" && r.stripePaymentIntentId && (
                        <Link href={`/payment/${r.id}`} className="btn-gold py-2 px-4 text-sm">
                          <CreditCard size={14} /> Payer maintenant
                        </Link>
                      )}
                      <Link href={`/reservations/${r.id}`} className="btn-ghost py-2 px-4 text-sm">
                        <Eye size={14} /> Détails
                      </Link>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancelling === r.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-red-400 border border-red-400/20 hover:bg-red-400/10 text-sm transition-all disabled:opacity-50"
                        >
                          <X size={14} />
                          {cancelling === r.id ? "Annulation..." : "Annuler"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-lg text-sm border transition-all ${
                  page === i ? "bg-gold-500/20 border-gold-500/50 text-gold-400" : "border-night-700 text-night-400"
                }`}
              >{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
