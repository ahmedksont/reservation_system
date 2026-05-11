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
import { Shield, Lock, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
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
        // ✅ Confirmer le paiement auprès du backend
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
        // Paiement réussi sans paymentIntent.status (redirection)
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
          className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-emerald-400" />
        </motion.div>
        <h2 className="font-display text-3xl text-night-50 mb-2">Paiement réussi !</h2>
        <p className="text-night-400">Redirection en cours...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-5 rounded-xl bg-night-800/30 border border-night-700">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={!stripe || processing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-gold w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock size={18} />
            Payer {amount.toFixed(2)}€
          </>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-4 text-night-500 text-xs">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-gold-400" />
          Paiement 100% sécurisé
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard size={12} className="text-gold-400" />
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
        // First get the reservation details
        const resData = await reservationApi.getById(reservationId);
        setReservation(resData.data);
        
        // Then get the client secret
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
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-gold-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-night-400">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center">
            <CreditCard size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-night-100 mb-2">
              Paiement indisponible
            </h2>
            <p className="text-night-400 mb-6">
              Cette réservation ne nécessite pas de paiement ou a déjà été payée.
            </p>
            <button onClick={() => router.push("/reservations")} className="btn-gold">
              Voir mes réservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#FBBF24',
        colorBackground: '#1A1A2E',
        colorText: '#FFFFFF',
        colorDanger: '#EF4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-5xl mx-auto">
        <motion.button
          onClick={() => router.back()}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-night-400 hover:text-night-200 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour
        </motion.button>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Payment form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3"
          >
            <div className="glass-card p-8">
              <h1 className="font-display text-3xl font-light text-night-50 mb-2">
                Finaliser le <span className="gold-text font-semibold">paiement</span>
              </h1>
              <p className="text-night-400 text-sm mb-8">
                Réservation #{reservationId.slice(0, 8).toUpperCase()}
              </p>

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
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="glass-card p-6 sticky top-28">
              <h2 className="font-display text-xl font-semibold text-night-100 mb-5">
                Récapitulatif
              </h2>
              <div className="space-y-4 mb-6">
                {reservation?.lignes?.map((ligne: any) => (
                  <div key={ligne.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-night-200 text-sm font-medium">
                        {ligne.chambre 
                          ? `Chambre ${ligne.chambre.numero} - ${ligne.chambre.type}`
                          : ligne.trajet 
                            ? `${ligne.trajet.lieuDepart} → ${ligne.trajet.lieuArrivee}` 
                            : "—"}
                      </p>
                      <p className="text-night-500 text-xs mt-0.5">
                        {ligne.dateArrivee && ligne.dateDepart
                          ? `${ligne.dateArrivee} → ${ligne.dateDepart}`
                          : ligne.nombrePlaces 
                            ? `${ligne.nombrePlaces} place(s)` 
                            : ""}
                      </p>
                    </div>
                    <span className="text-night-200 text-sm">
                      {ligne.prixTotal?.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-night-800 mb-4" />
              <div className="flex justify-between items-center">
                <span className="text-night-300 font-medium">Total</span>
                <span className="font-display text-2xl text-gold-400">
                  {reservation?.montantTotal?.toFixed(2)}€
                </span>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-emerald-400 text-xs text-center">
                  🔒 Paiement sécurisé - Vos données bancaires sont cryptées
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}