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
  ChevronRight,
  Bed,
  MapPin,
  ArrowRight,
  Shield,
  Clock,
  AlertCircle,
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

  const calculateNights = () => {
    if (!dateArrivee || !dateDepart) return 0;
    return Math.ceil(
      (new Date(dateDepart).getTime() - new Date(dateArrivee).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const calculateTotal = () => {
    if (!item) return 0;
    if (itemType === "chambre" && dateArrivee && dateDepart) {
      return (item as Chambre).prixParNuit * calculateNights();
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
        notes: "",
      };

      if (itemType === "chambre") {
        reservationData = {
          ...reservationData,
          chambreId: roomId,
          dateArrivee:  dateDepart,
          dateDepart:dateArrivee,
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
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-1/3 mb-4" />
            <div className="h-96 bg-stone-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
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
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Élément non trouvé
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              L&apos;élément que vous souhaitez réserver n&apos;est plus disponible.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
            >
              Retour
              <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();
  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-amber-100/25 blur-[100px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-sky-50/40 blur-[80px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-700 transition mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Retour
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">
              Finaliser votre séjour
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 mb-4 leading-tight">
              Nouvelle <span className="italic text-amber-800">Réservation</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
            >
              <h2 className="font-serif text-xl text-stone-900 mb-8">
                Informations personnelles
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Prénom *
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                      <User size={16} className="text-stone-400 shrink-0" />
                      <input
                        type="text"
                        required
                        value={formData.prenom}
                        onChange={(e) =>
                          setFormData({ ...formData, prenom: e.target.value })
                        }
                        className="bg-transparent text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                        placeholder="Ahmed"
                      />
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Nom *
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                      <User size={16} className="text-stone-400 shrink-0" />
                      <input
                        type="text"
                        required
                        value={formData.nom}
                        onChange={(e) =>
                          setFormData({ ...formData, nom: e.target.value })
                        }
                        className="bg-transparent text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                        placeholder="Ksontini"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Email *
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                      <Mail size={16} className="text-stone-400 shrink-0" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="bg-transparent text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                        placeholder="ahmed.ksontini@email.com"
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Téléphone *
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                      <Phone size={16} className="text-stone-400 shrink-0" />
                      <input
                        type="tel"
                        required
                        value={formData.telephone}
                        onChange={(e) =>
                          setFormData({ ...formData, telephone: e.target.value })
                        }
                        className="bg-transparent text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                        placeholder="+216 46280499"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                      submitting
                        ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                        : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Confirmer la réservation
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* Legal */}
                <div className="flex items-start gap-2 text-stone-400 text-xs">
                  <Shield size={14} className="shrink-0 mt-0.5" />
                  <p>
                    En confirmant, vous acceptez nos conditions générales de vente.
                    Paiement sécurisé par carte bancaire. Vos données sont protégées.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right column - Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-28 h-fit"
          >
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
              <h2 className="font-serif text-xl text-stone-900 mb-6">
                Récapitulatif
              </h2>

              {itemType === "chambre" ? (
                <>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <Bed size={22} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-stone-900 font-semibold">
                        Chambre {(item as Chambre).numero}
                      </p>
                      <p className="text-stone-500 text-sm">
                        {(item as Chambre).type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm border-t border-stone-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Prix par nuit</span>
                      <span className="text-stone-700 font-medium">
                        {Number((item as Chambre).prixParNuit).toFixed(2)}TND
                      </span>
                    </div>
                    {dateArrivee && dateDepart && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Arrivée</span>
                          <span className="text-stone-700 font-medium">{dateArrivee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Départ</span>
                          <span className="text-stone-700 font-medium">{dateDepart}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Nuits</span>
                          <span className="text-stone-700 font-medium">{nights}</span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Train size={22} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-stone-900 font-semibold">
                          {(item as Trajet).lieuDepart}
                        </span>
                        <ArrowRight size={14} className="text-stone-300" />
                        <span className="text-stone-900 font-semibold">
                          {(item as Trajet).lieuArrivee}
                        </span>
                      </div>
                      <p className="text-stone-500 text-sm">
                        {(item as Trajet).typeTransport}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm border-t border-stone-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Prix par place</span>
                      <span className="text-stone-700 font-medium">
                        {Number((item as Trajet).prixParPlace).toFixed(2)}TND
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Nombre de places</span>
                      <span className="text-stone-700 font-medium">1</span>
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="border-t border-stone-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-900 font-semibold">Total TTC</span>
                  <span className="font-serif text-2xl font-semibold text-amber-700">
                    {total.toFixed(2)}TND
                  </span>
                </div>
              </div>

              {/* Security badge */}
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-xs">
                  Paiement sécurisé. Vos informations sont protégées par chiffrement SSL.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}