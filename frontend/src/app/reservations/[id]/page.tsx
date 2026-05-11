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
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { reservationApi } from "@/lib/api";
import type { Reservation } from "@/types";
import toast from "react-hot-toast";

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: "En attente",
    className: "badge-pending",
    icon: Clock,
    color: "text-yellow-400",
  },
  CONFIRMEE: {
    label: "Confirmée",
    className: "badge-confirmed",
    icon: CheckCircle,
    color: "text-green-400",
  },
  ANNULEE: {
    label: "Annulée",
    className: "badge-cancelled",
    icon: XCircle,
    color: "text-red-400",
  },
  TERMINEE: {
    label: "Terminée",
    className: "badge-paid",
    icon: CheckCircle,
    color: "text-blue-400",
  },
} as const;

const PAIEMENT_CONFIG = {
  EN_ATTENTE: {
    label: "En attente de paiement",
    className: "badge-pending",
    icon: Clock,
  },
  PAYE: {
    label: "Payé",
    className: "badge-confirmed",
    icon: CheckCircle,
  },
  REMBOURSE: {
    label: "Remboursé",
    className: "badge-paid",
    icon: CheckCircle,
  },
  ECHOUE: {
    label: "Échoué",
    className: "badge-cancelled",
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
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="font-display text-2xl text-night-100 mb-4">
              Réservation non trouvée
            </h2>
            <Link href="/reservations" className="btn-gold">
              Voir mes réservations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statutCfg = STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG];
  const paiementCfg = PAIEMENT_CONFIG[reservation.statutPaiement as keyof typeof PAIEMENT_CONFIG];
  const StatutIcon = statutCfg?.icon || Clock;
  const PaiementIcon = paiementCfg?.icon || Clock;

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-night-400 hover:text-gold-400 transition mb-6"
        >
          <ArrowLeft size={18} />
          Retour
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-gold-400 text-sm mb-1">Réservation</p>
                <h1 className="font-display text-3xl text-night-100">
                  #{reservation.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-night-500 text-sm mt-2">
                  Créée le{" "}
                  {format(new Date(reservation.createdAt), "d MMMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <StatutIcon size={16} className={statutCfg?.color || "text-gray-400"} />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statutCfg?.className}`}>
                    {statutCfg?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PaiementIcon size={16} className="text-night-400" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${paiementCfg?.className}`}>
                    {paiementCfg?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="glass-card p-6">
            <h2 className="font-display text-xl text-night-100 mb-4">
              Détails de la réservation
            </h2>
            <div className="space-y-4">
              {reservation.lignes.map((ligne) => (
                <div
                  key={ligne.id}
                  className="p-4 rounded-xl bg-night-800/50 border border-night-700"
                >
                  {ligne.chambre ? (
                    // Hotel room
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                        <Hotel size={20} className="text-gold-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-night-100 font-medium">
                          Chambre {ligne.chambre.numero} - {ligne.chambre.type}
                        </p>
                        <p className="text-night-400 text-sm mt-1">
                          Du {ligne.dateArrivee} au {ligne.dateDepart}
                        </p>
                        {ligne.chambre.description && (
                          <p className="text-night-500 text-sm mt-2">
                            {ligne.chambre.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 font-semibold">
                          {ligne.prixTotal}€
                        </p>
                        <p className="text-night-500 text-xs">
                          {ligne.chambre.prixParNuit}€/nuit
                        </p>
                      </div>
                    </div>
                  ) : ligne.trajet ? (
                    // Transport
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                        <Train size={20} className="text-gold-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-night-100 font-medium">
                          {ligne.trajet.lieuDepart} → {ligne.trajet.lieuArrivee}
                        </p>
                        <p className="text-night-400 text-sm mt-1">
                          {ligne.trajet.typeTransport} • {ligne.nombrePlaces} place(s)
                        </p>
                        <p className="text-night-500 text-sm">
                          Départ: {format(new Date(ligne.trajet.dateDepart), "d MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 font-semibold">
                          {ligne.prixTotal}€
                        </p>
                        <p className="text-night-500 text-xs">
                          {ligne.trajet.prixParPlace}€/place
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center">
              <span className="text-night-200 text-lg">Total TTC</span>
              <span className="font-display text-3xl text-gold-400 font-bold">
                {reservation.montantTotal.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-6">
            <h2 className="font-display text-xl text-night-100 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {reservation.statutPaiement === "EN_ATTENTE" && reservation.stripePaymentIntentId && (
                <button onClick={handlePayment} className="btn-gold">
                  <CreditCard size={16} />
                  Payer maintenant
                </button>
              )}
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-ghost"
              >
                <Download size={16} />
                Télécharger la facture
              </button>
              <Link href="/contact" className="btn-ghost">
                <Mail size={16} />
                Contacter le support
              </Link>
            </div>
          </div>

          {/* Info message for pending payment */}
          {reservation.statutPaiement === "EN_ATTENTE" && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                ⚠️ Le paiement n'a pas encore été effectué. Veuillez procéder au paiement pour confirmer votre réservation.
              </p>
            </div>
          )}

          {/* Info message for confirmed */}
          {reservation.statut === "CONFIRMEE" && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm">
                ✓ Votre réservation est confirmée. Vous recevrez un email de confirmation avec tous les détails.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}