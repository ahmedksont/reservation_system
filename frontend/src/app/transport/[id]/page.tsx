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
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { trajetApi, reservationApi } from "@/lib/api";
import type { Trajet } from "@/types";
import toast from "react-hot-toast";

const TRANSPORT_ICONS = { TRAIN: Train, AVION: Plane, BUS: Bus, BATEAU: Ship };
const TRANSPORT_LABELS = { TRAIN: "Train", AVION: "Avion", BUS: "Bus", BATEAU: "Bateau" };
const TRANSPORT_COLORS = {
  TRAIN: "text-blue-400",
  AVION: "text-cyan-400",
  BUS: "text-green-400",
  BATEAU: "text-teal-400",
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
      
      // Rediriger vers la page de paiement
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
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!trajet) {
    return (
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-night-100 mb-4">Trajet non trouvé</h2>
            <button onClick={() => router.push("/transport")} className="btn-gold">
              Voir les trajets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = TRANSPORT_ICONS[trajet.typeTransport] || Train;
  const IconColor = TRANSPORT_COLORS[trajet.typeTransport] || "text-gold-400";
  const dateDepart = new Date(trajet.dateDepart);
  const dateArrivee = new Date(trajet.dateArrivee);
  const dureeMinutes = Math.round((dateArrivee.getTime() - dateDepart.getTime()) / 60000);
  const heures = Math.floor(dureeMinutes / 60);
  const minutes = dureeMinutes % 60;

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-5xl mx-auto">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Trip details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gold-500/10 border border-gold-500/20">
                    <Icon size={32} className={IconColor} />
                  </div>
                  <div>
                    <p className="text-gold-400 text-sm mb-1">Trajet</p>
                    <h1 className="font-display text-3xl text-night-100">
                      {trajet.lieuDepart} → {trajet.lieuArrivee}
                    </h1>
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-gold-500/10 text-gold-400 mt-2">
                      {TRANSPORT_LABELS[trajet.typeTransport]}
                    </span>
                  </div>
                </div>

                {/* Journey timeline */}
                <div className="relative mt-8">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gold-500/20" />
                  
                  <div className="relative flex items-start gap-4 pb-8">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center z-10">
                      <div className="w-3 h-3 rounded-full bg-gold-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-night-100">
                        {format(dateDepart, "HH:mm")}
                      </p>
                      <p className="text-night-400">
                        {format(dateDepart, "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-night-500 text-sm mt-1">{trajet.lieuDepart}</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-night-800 flex items-center justify-center z-10">
                      <ArrowRight size={20} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-night-400 text-sm">
                        Durée : {heures}h{minutes > 0 ? ` ${minutes}min` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4 pt-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center z-10">
                      <div className="w-3 h-3 rounded-full bg-gold-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-night-100">
                        {format(dateArrivee, "HH:mm")}
                      </p>
                      <p className="text-night-400">
                        {format(dateArrivee, "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-night-500 text-sm mt-1">{trajet.lieuArrivee}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="glass-card p-6">
                <h2 className="font-display text-xl text-night-100 mb-4">Détails du voyage</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-night-500 text-sm">Transport</p>
                    <p className="text-night-100 font-medium mt-1">{TRANSPORT_LABELS[trajet.typeTransport]}</p>
                  </div>
                  <div>
                    <p className="text-night-500 text-sm">Numéro véhicule</p>
                    <p className="text-night-100 font-medium mt-1">{trajet.numeroVehicule || "Non communiqué"}</p>
                  </div>
                  <div>
                    <p className="text-night-500 text-sm">Places totales</p>
                    <p className="text-night-100 font-medium mt-1">{trajet.placesTotal}</p>
                  </div>
                  <div>
                    <p className="text-night-500 text-sm">Places disponibles</p>
                    <p className={`font-medium mt-1 ${trajet.placesDisponibles > 0 ? "text-green-400" : "text-red-400"}`}>
                      {trajet.placesDisponibles}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Booking card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-28"
          >
            <div className="glass-card p-6">
              <div className="mb-6">
                <p className="text-night-500 text-sm mb-1">Prix par place</p>
                <p className="font-display text-4xl font-bold text-gold-400">
                  {trajet.prixParPlace}€
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-night-300 text-sm mb-2 flex items-center gap-2">
                    <Users size={14} />
                    Nombre de places
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNombrePlaces(Math.max(1, nombrePlaces - 1))}
                      className="w-10 h-10 rounded-lg border border-night-700 hover:border-gold-500 text-night-300 hover:text-gold-400 transition"
                    >
                      -
                    </button>
                    <span className="text-night-100 text-xl font-semibold w-12 text-center">
                      {nombrePlaces}
                    </span>
                    <button
                      onClick={() => setNombrePlaces(Math.min(trajet.placesDisponibles, nombrePlaces + 1))}
                      className="w-10 h-10 rounded-lg border border-night-700 hover:border-gold-500 text-night-300 hover:text-gold-400 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-night-800 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-night-400">Prix par place</span>
                  <span className="text-night-100">{trajet.prixParPlace}€</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-night-400">Nombre de places</span>
                  <span className="text-night-100">{nombrePlaces}</span>
                </div>
                <div className="border-t border-night-700 my-3" />
                <div className="flex justify-between font-semibold">
                  <span className="text-night-100">Total TTC</span>
                  <span className="text-gold-400 text-xl">
                    {trajet.prixParPlace * nombrePlaces}€
                  </span>
                </div>
              </div>

              <button
                onClick={handleReserve}
                disabled={reserving || trajet.placesDisponibles < 1}
                className={`btn-gold w-full justify-center ${(reserving || trajet.placesDisponibles < 1) && "opacity-50 cursor-not-allowed"}`}
              >
                {reserving ? (
                  "Réservation en cours..."
                ) : trajet.placesDisponibles < 1 ? (
                  "Complet"
                ) : (
                  <>
                    <CreditCard size={16} />
                    Réserver maintenant
                  </>
                )}
              </button>

              <p className="text-night-500 text-xs text-center mt-4">
                Paiement sécurisé. Réservation garantie immédiatement.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}