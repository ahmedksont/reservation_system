"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Shield,
  Lock,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Bed,
  Train,
  MapPin,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { reservationApi } from "@/lib/api";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ reservationId, amount }: { reservationId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Le système de paiement n'est pas initialisé");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/reservations/${reservationId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        setErrorMessage(error.message || "Une erreur est survenue");
        toast.error(error.message || "Erreur de paiement");
        setProcessing(false);
      } else if (paymentIntent?.status === "succeeded") {
        try {
          await reservationApi.confirmPayment(reservationId);
          console.log("✅ Paiement confirmé dans le backend");
        } catch (confirmError) {
          console.error("Error confirming payment:", confirmError);
          toast.warning("Paiement réussi mais la confirmation a échoué. Vérifiez votre réservation.");
        }

        setSucceeded(true);
        toast.success("Paiement réussi !");
        setTimeout(() => {
          router.push(`/reservations/${reservationId}`);
        }, 2000);
      } else {
        try {
          await reservationApi.confirmPayment(reservationId);
          console.log("✅ Paiement confirmé dans le backend");
        } catch (confirmError) {
          console.error("Error confirming payment:", confirmError);
        }

        setSucceeded(true);
        toast.success("Paiement réussi !");
        setTimeout(() => {
          router.push(`/reservations/${reservationId}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMessage("Une erreur inattendue est survenue");
      toast.error("Une erreur inattendue est survenue");
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-16"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-emerald-600" />
        </motion.div>
        <h2 className="font-serif text-3xl text-stone-900 mb-2">Paiement réussi !</h2>
        <p className="text-stone-500">Redirection en cours...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
          processing || !stripe
            ? "bg-stone-100 text-stone-400 cursor-not-allowed"
            : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20"
        }`}
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock size={16} />
            Payer {amount.toFixed(2)}€
            <ChevronRight size={14} />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-6 text-stone-400 text-xs">
        <div className="flex items-center gap-1.5">
          <Shield size={12} />
          Paiement 100% sécurisé
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard size={12} />
          Propulsé par Stripe
        </div>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await reservationApi.getById(reservationId);
        setReservation(resData.data);

        const secretData = await reservationApi.getClientSecret(reservationId);
        setClientSecret(secretData.data.clientSecret);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          toast.error("Veuillez vous reconnecter");
          router.push("/auth/login");
        } else {
          toast.error("Impossible de charger les informations de paiement");
          router.push("/reservations");
        }
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchData();
    }
  }, [reservationId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard size={24} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Paiement indisponible
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Cette réservation ne nécessite pas de paiement ou a déjà été payée.
            </p>
            <button
              onClick={() => router.push("/reservations")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
            >
              Voir mes réservations
              <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#78716c',
        colorBackground: '#fafaf8',
        colorText: '#44403c',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e7e5e4',
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '1px solid #d6d3d1',
          boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.1)',
        },
        '.Label': {
          color: '#78716c',
          fontSize: '12px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
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
          <motion.button
            onClick={() => router.back()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
              Paiement sécurisé
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 mb-4 leading-tight">
              Finaliser le <span className="italic text-amber-800">Paiement</span>
            </h1>
            <p className="text-stone-500 text-sm">
              Réservation #{reservationId.slice(0, 8).toUpperCase()}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Payment form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                  reservationId={reservationId}
                  amount={reservation?.montantTotal || 0}
                />
              </Elements>
            </div>
          </motion.div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300 lg:sticky lg:top-28">
              <h2 className="font-serif text-xl text-stone-900 mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                {reservation?.lignes?.map((ligne: any) => (
                  <div key={ligne.id} className="flex items-start justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ligne.chambre ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"
                      }`}>
                        {ligne.chambre ? (
                          <Bed size={18} className="text-amber-600" />
                        ) : (
                          <Train size={18} className="text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-stone-900 text-sm font-medium">
                          {ligne.chambre
                            ? `Chambre ${ligne.chambre.numero}`
                            : ligne.trajet
                              ? `${ligne.trajet.lieuDepart} → ${ligne.trajet.lieuArrivee}`
                              : "—"}
                        </p>
                        <p className="text-stone-500 text-xs mt-0.5">
                          {ligne.dateArrivee && ligne.dateDepart
                            ? `${ligne.dateArrivee} → ${ligne.dateDepart}`
                            : ligne.nombrePlaces
                              ? `${ligne.nombrePlaces} place(s)`
                              : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-stone-900 text-sm font-medium tabular-nums">
                      {ligne.prixTotal?.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-900 font-semibold">Total TTC</span>
                  <span className="font-serif text-2xl font-semibold text-amber-700">
                    {reservation?.montantTotal?.toFixed(2)}€
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Lock size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-xs">
                  Paiement sécurisé · Vos données bancaires sont cryptées
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}