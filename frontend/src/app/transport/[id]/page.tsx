"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Train,
  Plane,
  Bus,
  Ship,
  MapPin,
  Clock,
  Users,
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  Shield,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { trajetApi, reservationApi } from "@/lib/api";
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
  TRAIN: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600", accent: "text-emerald-700" },
  AVION: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", icon: "text-sky-600", accent: "text-sky-700" },
  BUS: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600", accent: "text-amber-700" },
  BATEAU: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-600", accent: "text-indigo-700" },
};

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [nombrePlaces, setNombrePlaces] = useState(Number(searchParams.get("places") || 1));
  const [reserving, setReserving] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    const fetchTrajet = async () => {
      try {
        setLoading(true);
        const { data } = await trajetApi.getById(id);
        setTrajet(data);
      } catch (error) {
        console.error("Error fetching trajet:", error);
        toast.error("Trajet non trouvé");
        router.push("/transport");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrajet();
    }
  }, [id, router]);

  const handleReserve = async () => {
    if (!trajet) return;

    if (nombrePlaces > trajet.placesDisponibles) {
      toast.error(`Seulement ${trajet.placesDisponibles} place(s) disponible(s)`);
      return;
    }

    setReserving(true);
    try {
      const reservationData = {
        trajetId: trajet.id,
        nombrePlaces: nombrePlaces,
        notes: `Réservation de ${nombrePlaces} place(s) pour ${trajet.lieuDepart} → ${trajet.lieuArrivee}`,
      };

      const { data } = await reservationApi.create(reservationData);

      toast.success("Réservation créée avec succès !");

      if (data.stripePaymentIntentId) {
        router.push(`/payment/${data.id}`);
      } else {
        router.push(`/reservations/${data.id}`);
      }
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la réservation");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-1/3 mb-4" />
            <div className="h-64 bg-stone-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trajet) {
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
              <AlertCircle size={24} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Trajet non trouvé</h2>
            <p className="text-stone-500 text-sm mb-6">Le trajet que vous recherchez n'existe pas ou a été supprimé.</p>
            <button
              onClick={() => router.push("/transport")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
            >
              Voir les trajets
              <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const Icon = TRANSPORT_ICONS[trajet.typeTransport] || Train;
  const colors = TRANSPORT_COLORS[trajet.typeTransport] || TRANSPORT_COLORS.TRAIN;
  const dateDepart = new Date(trajet.dateDepart);
  const dateArrivee = new Date(trajet.dateArrivee);
  const dureeMinutes = Math.round((dateArrivee.getTime() - dateDepart.getTime()) / 60000);
  const heures = Math.floor(dureeMinutes / 60);
  const minutes = dureeMinutes % 60;
  const totalPrice = Number(trajet.prixParPlace) * nombrePlaces;
  const isFull = trajet.placesDisponibles < 1;
  const isOverCapacity = nombrePlaces > trajet.placesDisponibles;

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
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-700 transition mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Retour aux résultats
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">
              Détail du trajet
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 mb-4 leading-tight">
              {trajet.lieuDepart} <span className="italic text-amber-800">→</span> {trajet.lieuArrivee}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                <Icon size={14} />
                {TRANSPORT_LABELS[trajet.typeTransport]}
              </span>
              <span className="text-stone-500 text-sm">
                {format(dateDepart, "EEEE d MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Trip details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Timeline Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
            >
              <h2 className="font-serif text-xl text-stone-900 mb-8">Itinéraire</h2>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-stone-200" />

                {/* Departure */}
                <div className="relative flex items-start gap-5 pb-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg} border ${colors.border} z-10`}>
                    <div className={`w-3 h-3 rounded-full ${colors.icon.replace("text-", "bg-")}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-serif font-semibold text-stone-900">
                        {format(dateDepart, "HH:mm")}
                      </span>
                      <span className="text-stone-500 text-sm">
                        {format(dateDepart, "EEEE d MMMM", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <MapPin size={14} className="text-stone-400" />
                      <span className="font-medium">{trajet.lieuDepart}</span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="relative flex items-start gap-5 pb-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200 z-10">
                    <Clock size={18} className="text-stone-400" />
                  </div>
                  <div className="pt-2.5">
                    <span className="text-sm font-medium text-stone-500">
                      Durée du voyage : {heures}h{minutes > 0 ? ` ${minutes}min` : ""}
                    </span>
                  </div>
                </div>

                {/* Arrival */}
                <div className="relative flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg} border ${colors.border} z-10`}>
                    <MapPin size={18} className={colors.icon} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-serif font-semibold text-stone-900">
                        {format(dateArrivee, "HH:mm")}
                      </span>
                      <span className="text-stone-500 text-sm">
                        {format(dateArrivee, "EEEE d MMMM", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <MapPin size={14} className="text-stone-400" />
                      <span className="font-medium">{trajet.lieuArrivee}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
            >
              <h2 className="font-serif text-xl text-stone-900 mb-6">Détails du voyage</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Transport</p>
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={colors.icon} />
                    <span className="text-stone-900 font-medium">{TRANSPORT_LABELS[trajet.typeTransport]}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Numéro véhicule</p>
                  <span className="text-stone-900 font-medium font-mono">{trajet.numeroVehicule || "Non communiqué"}</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Places totales</p>
                  <span className="text-stone-900 font-medium">{trajet.placesTotal} places</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Disponibilité</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${trajet.placesDisponibles > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {trajet.placesDisponibles} place{trajet.placesDisponibles > 1 ? "s" : ""}
                    </span>
                    {trajet.placesDisponibles < 5 && trajet.placesDisponibles > 0 && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        Bientôt complet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Booking card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-28 h-fit"
          >
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
              {/* Price header */}
              <div className="mb-6 pb-6 border-b border-stone-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Prix par place</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-semibold text-stone-900">
                    {Number(trajet.prixParPlace).toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Passenger selector */}
              <div className="mb-6">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
                  <Users size={12} />
                  Nombre de places
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNombrePlaces(Math.max(1, nombrePlaces - 1))}
                    disabled={nombrePlaces <= 1}
                    className="w-12 h-12 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.95]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-stone-900 text-xl font-semibold w-12 text-center tabular-nums">
                    {nombrePlaces}
                  </span>
                  <button
                    onClick={() => setNombrePlaces(Math.min(trajet.placesDisponibles, nombrePlaces + 1))}
                    disabled={nombrePlaces >= trajet.placesDisponibles}
                    className="w-12 h-12 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.95]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {isOverCapacity && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Maximum {trajet.placesDisponibles} place(s) disponible(s)
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">{Number(trajet.prixParPlace).toFixed(2)}€ × {nombrePlaces} place{nombrePlaces > 1 ? "s" : ""}</span>
                  <span className="text-stone-700 font-medium">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                  <span className="text-stone-900 font-semibold">Total TTC</span>
                  <span className="font-serif text-2xl font-semibold text-amber-700">
                    {totalPrice.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleReserve}
                disabled={reserving || isFull || isOverCapacity}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                  reserving || isFull || isOverCapacity
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20"
                }`}
              >
                {reserving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                    Réservation en cours...
                  </>
                ) : isFull ? (
                  "Complet"
                ) : (
                  <>
                    <CreditCard size={16} />
                    Réserver maintenant
                    <ChevronRight size={14} />
                  </>
                )}
              </button>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 mt-4 text-stone-400 text-xs">
                <Shield size={12} />
                <span>Paiement sécurisé · Réservation instantanée</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}