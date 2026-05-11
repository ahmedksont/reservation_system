"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Hotel,
  Train,
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { chambreApi, trajetApi, reservationApi } from "@/lib/api";
import type { Chambre, Trajet } from "@/types";
import toast from "react-hot-toast";

export default function NewReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get("roomId");
  const trajetId = searchParams.get("trajetId");
  const dateArrivee = searchParams.get("dateArrivee");
  const dateDepart = searchParams.get("dateDepart");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<Chambre | Trajet | null>(null);
  const [itemType, setItemType] = useState<"chambre" | "trajet" | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        if (roomId) {
          const { data } = await chambreApi.getById(roomId);
          setItem(data);
          setItemType("chambre");
        } else if (trajetId) {
          const { data } = await trajetApi.getById(trajetId);
          setItem(data);
          setItemType("trajet");
        } else {
          toast.error("Aucun élément sélectionné");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Erreur chargement des informations");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [roomId, trajetId, router]);

  const calculateTotal = () => {
    if (!item) return 0;
    if (itemType === "chambre" && dateArrivee && dateDepart) {
      const nights = Math.ceil(
        (new Date(dateDepart).getTime() - new Date(dateArrivee).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return (item as Chambre).prixParNuit * nights;
    }
    if (itemType === "trajet") {
      return (item as Trajet).prixParPlace;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    let reservationData: any = {
      notes: "", // Optional
    };

    if (itemType === "chambre") {
      reservationData = {
        ...reservationData,
        chambreId: roomId,
        dateArrivee: dateArrivee,
        dateDepart: dateDepart,
      };
    } else if (itemType === "trajet") {
      reservationData = {
        ...reservationData,
        trajetId: trajetId,
        nombrePlaces: 1,
      };
    }

    console.log("Sending reservation data:", reservationData);
    
    const { data } = await reservationApi.create(reservationData);
    
    console.log("Reservation created:", data);

    toast.success("Réservation créée avec succès !");

    // Redirect to payment or reservation details
    if (data.stripePaymentIntentId && data.clientSecret) {
      router.push(`/payment/${data.id}`);
    } else {
      router.push(`/reservations/${data.id}`);
    }
  } catch (error: any) {
    console.error("Error creating reservation:", error);
    console.error("Response data:", error.response?.data);
    toast.error(error.response?.data?.message || "Erreur création réservation");
  } finally {
    setSubmitting(false);
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

  if (!item) {
    return (
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="font-display text-2xl text-night-100 mb-4">
              Élément non trouvé
            </h2>
            <button onClick={() => router.back()} className="btn-gold">
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
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
          {/* Left column - Reservation details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h1 className="font-display text-2xl text-night-100 mb-6">
                Nouvelle réservation
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal info */}
                <div>
                  <h2 className="font-display text-lg text-night-200 mb-4 flex items-center gap-2">
                    <User size={18} className="text-gold-400" />
                    Informations personnelles
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-night-300 text-sm mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prenom}
                        onChange={(e) =>
                          setFormData({ ...formData, prenom: e.target.value })
                        }
                        className="input-gold w-full"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-night-300 text-sm mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nom}
                        onChange={(e) =>
                          setFormData({ ...formData, nom: e.target.value })
                        }
                        className="input-gold w-full"
                        placeholder="Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-night-300 text-sm mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input-gold w-full"
                        placeholder="jean.dupont@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-night-300 text-sm mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telephone}
                        onChange={(e) =>
                          setFormData({ ...formData, telephone: e.target.value })
                        }
                        className="input-gold w-full"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full justify-center py-3"
                >
                  {submitting ? (
                    "Création en cours..."
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Confirmer la réservation
                    </>
                  )}
                </button>

                <p className="text-night-500 text-xs text-center">
                  En confirmant, vous acceptez nos conditions générales de vente.
                  Paiement sécurisé par carte bancaire.
                </p>
              </form>
            </motion.div>
          </div>

          {/* Right column - Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-28"
          >
            <div className="glass-card p-6">
              <h2 className="font-display text-lg text-night-100 mb-4">
                Récapitulatif
              </h2>

              {itemType === "chambre" ? (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                      <Hotel size={20} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-night-100 font-medium">
                        Chambre {(item as Chambre).numero}
                      </p>
                      <p className="text-night-400 text-sm">
                        {(item as Chambre).type}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t border-night-800 pt-4">
                    <div className="flex justify-between">
                      <span className="text-night-400">Prix par nuit</span>
                      <span className="text-night-200">
                        {(item as Chambre).prixParNuit}€
                      </span>
                    </div>
                    {dateArrivee && dateDepart && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-night-400">Arrivée</span>
                          <span className="text-night-200">{dateArrivee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-night-400">Départ</span>
                          <span className="text-night-200">{dateDepart}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-night-400">Nuits</span>
                          <span className="text-night-200">
                            {Math.ceil(
                              (new Date(dateDepart).getTime() -
                                new Date(dateArrivee).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                      <Train size={20} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-night-100 font-medium">
                        {(item as Trajet).lieuDepart} → {(item as Trajet).lieuArrivee}
                      </p>
                      <p className="text-night-400 text-sm">
                        {(item as Trajet).typeTransport}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t border-night-800 pt-4">
                    <div className="flex justify-between">
                      <span className="text-night-400">Prix par place</span>
                      <span className="text-night-200">
                        {(item as Trajet).prixParPlace}€
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-night-400">Nombre de places</span>
                      <span className="text-night-200">1</span>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-night-800 mt-4 pt-4">
                <div className="flex justify-between font-semibold">
                  <span className="text-night-100">Total à payer</span>
                  <span className="text-gold-400 text-xl font-bold">
                    {total}€
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5" />
                <p className="text-green-400 text-xs">
                  Paiement sécurisé. Vos informations sont protégées.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}