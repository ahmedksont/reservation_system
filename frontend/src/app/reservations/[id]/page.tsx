"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Hotel,
  Train,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Mail,
  ChevronRight,
  Bed,
  MapPin,
  ArrowRight,
  Shield,
  AlertTriangle,
  Printer,
  HelpCircle,
  Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { reservationApi } from "@/lib/api";
import type { Reservation } from "@/types";
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
    icon: CheckCircle,
  },
  ANNULEE: {
    label: "Annulée",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: XCircle,
  },
  TERMINEE: {
    label: "Terminée",
    bg: "bg-stone-100",
    border: "border-stone-200",
    text: "text-stone-600",
    icon: CheckCircle,
  },
} as const;

const PAIEMENT_CONFIG = {
  EN_ATTENTE: {
    label: "En attente de paiement",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
  },
  PAYE: {
    label: "Payé",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle,
  },
  REMBOURSE: {
    label: "Remboursé",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    icon: CheckCircle,
  },
  ECHOUE: {
    label: "Échoué",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: XCircle,
  },
} as const;

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const { data } = await reservationApi.getById(id);
        setReservation(data);
      } catch (error) {
        console.error("Error fetching reservation:", error);
        toast.error("Réservation non trouvée");
        router.push("/reservations");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReservation();
    }
  }, [id, router]);

  const handlePayment = async () => {
    try {
      const { data } = await reservationApi.getClientSecret(id);
      if (data.clientSecret) {
        router.push(`/payment/${id}`);
      } else {
        toast.error("Impossible de récupérer les informations de paiement");
      }
    } catch (error) {
      console.error("Error getting payment info:", error);
      toast.error("Erreur lors de la préparation du paiement");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-1/3 mb-4" />
            <div className="h-64 bg-stone-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200/80 p-16"
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Réservation non trouvée
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              La réservation que vous recherchez n&apos;existe pas ou a été supprimée.
            </p>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
            >
              Voir mes réservations
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const statutCfg = STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG];
  const paiementCfg = PAIEMENT_CONFIG[reservation.statutPaiement as keyof typeof PAIEMENT_CONFIG];
  const StatutIcon = statutCfg?.icon || Clock;
  const PaiementIcon = paiementCfg?.icon || Clock;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-amber-100/25 blur-[100px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-sky-50/40 blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-700 transition mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Retour aux réservations
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">
              Réservation
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 mb-4 leading-tight">
              #{reservation.id.slice(0, 8).toUpperCase()}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${statutCfg.bg} ${statutCfg.text} ${statutCfg.border}`}
              >
                <StatutIcon size={10} />
                {statutCfg.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${paiementCfg.bg} ${paiementCfg.text} ${paiementCfg.border}`}
              >
                <PaiementIcon size={10} />
                {paiementCfg.label}
              </span>
              <span className="text-stone-500 text-sm flex items-center gap-1">
                <Calendar size={14} />
                {format(new Date(reservation.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
        {/* Line Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
        >
          <h2 className="font-serif text-xl text-stone-900 mb-6">
            Détails de la réservation
          </h2>
          <div className="space-y-4">
            {reservation.lignes.map((ligne) => (
              <div
                key={ligne.id}
                className="p-5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors"
              >
                {ligne.chambre ? (
                  // Hotel room
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <Bed size={22} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-stone-900 font-semibold text-lg">
                          Chambre {ligne.chambre.numero}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                          {ligne.chambre.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-2">
                        <Calendar size={13} />
                        <span>Du {ligne.dateArrivee} au {ligne.dateDepart}</span>
                      </div>
                      {ligne.chambre.description && (
                        <p className="text-stone-500 text-sm leading-relaxed">
                          {ligne.chambre.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-xl font-semibold text-stone-900">
                        {ligne.prixTotal.toFixed(2)}€
                      </p>
                      <p className="text-stone-400 text-xs">
                        {Number(ligne.chambre.prixParNuit).toFixed(2)}€/nuit
                      </p>
                    </div>
                  </div>
                ) : ligne.trajet ? (
                  // Transport
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Train size={22} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-stone-900 font-semibold text-lg">
                          {ligne.trajet.lieuDepart}
                        </span>
                        <ArrowRight size={14} className="text-stone-300" />
                        <span className="text-stone-900 font-semibold text-lg">
                          {ligne.trajet.lieuArrivee}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-stone-500 text-sm flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} />
                          {ligne.trajet.typeTransport}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={13} />
                          {ligne.nombrePlaces} place{(ligne.nombrePlaces || 0) > 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {format(new Date(ligne.trajet.dateDepart), "d MMMM yyyy à HH:mm", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-xl font-semibold text-stone-900">
                        {ligne.prixTotal.toFixed(2)}€
                      </p>
                      <p className="text-stone-400 text-xs">
                        {Number(ligne.trajet.prixParPlace).toFixed(2)}€/place
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-stone-900 font-semibold text-lg">Total TTC</p>
              <p className="text-stone-500 text-sm">Montant total de la réservation</p>
            </div>
            <span className="font-serif text-3xl font-semibold text-amber-700">
              {reservation.montantTotal.toFixed(2)}€
            </span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
        >
          <h2 className="font-serif text-xl text-stone-900 mb-6">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {reservation.statutPaiement === "EN_ATTENTE" && reservation.stripePaymentIntentId && (
              <button
                onClick={handlePayment}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all active:scale-[0.98]"
              >
                <CreditCard size={16} />
                Payer maintenant
                <ChevronRight size={14} />
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]"
            >
              <Printer size={16} />
              Imprimer la facture
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]"
            >
              <HelpCircle size={16} />
              Contacter le support
            </Link>
          </div>
        </motion.div>

        {/* Info Messages */}
        {reservation.statutPaiement === "EN_ATTENTE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium text-sm mb-0.5">
                Paiement en attente
              </p>
              <p className="text-amber-700 text-sm">
                Le paiement n&apos;a pas encore été effectué. Veuillez procéder au paiement pour confirmer votre réservation.
              </p>
            </div>
          </motion.div>
        )}

        {reservation.statut === "CONFIRMEE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
          >
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-800 font-medium text-sm mb-0.5">
                Réservation confirmée
              </p>
              <p className="text-emerald-700 text-sm">
                Votre réservation est confirmée. Vous recevrez un email de confirmation avec tous les détails.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}