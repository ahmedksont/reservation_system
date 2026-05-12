"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "react-router-dom"; // Note: User might be using next/navigation or react-router. Looking at previous context it's Next.js.
import { useParams as useNextParams, useRouter as useNextRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Hotel,
  Info,
  Wifi,
  Coffee,
  Star,
  Download,
  HelpCircle,
  Shield,
  Train as Bus,
  MapPin,
  Clock,
  User,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { reservationApi } from "@/lib/api";
import type { Reservation } from "@/types";
import toast from "react-hot-toast";

const STATUT_CONFIG = {
  EN_ATTENTE: { label: "En attente", color: "amber", icon: Clock },
  CONFIRMEE: { label: "Confirmée", color: "emerald", icon: Shield },
  ANNULEE: { label: "Annulée", color: "red", icon: AlertTriangle },
  TERMINEE: { label: "Terminée", color: "stone", icon: Shield },
} as const;

export default function ReservationDetailPage() {
  const params = useNextParams();
  const router = useNextRouter();
  const [reservation, setReservation] = useState<any | null>(null);
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
    if (id) fetchReservation();
  }, [id, router]);

  const handlePayment = async () => {
    try {
      const { data } = await reservationApi.getClientSecret(id);
      if (data.clientSecret) router.push(`/payment/${id}`);
    } catch (error) {
      toast.error("Erreur de paiement");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDFDFC] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
    </div>
  );

  if (!reservation) return null;

  const isPaid = reservation.statutPaiement === "PAYE";
  const clientName = `${reservation.client.prenom} ${reservation.client.nom}`;

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1C1917] pb-20 selection:bg-amber-100">
      <Navbar />

      <div className="pt-32 px-4 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-stone-200/60 overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-8 pb-4">
            <div className="flex justify-between items-start mb-10">
              <div className={`px-4 py-1.5 rounded-full border ${isPaid ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'} text-[10px] font-bold uppercase tracking-wider flex items-center gap-2`}>
                <Info size={12} />
                {isPaid ? 'BILLET VALIDÉ' : 'PAIEMENT REQUIS'}
              </div>
              <div className="text-right">
                <p className="text-stone-400 text-[9px] font-bold uppercase tracking-widest mb-1">ID PASSE</p>
                <p className="text-stone-900 font-bold text-sm">#{reservation.id.slice(0, 7).toUpperCase()}</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
              Luxury <span className="font-serif font-light text-amber-700/60 italic">Travel Pass</span>
            </h1>

            <div className="h-[1px] w-full bg-stone-100 mb-8" />

            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">VOYAGEUR</p>
                <p className="text-stone-900 font-bold text-xl capitalize">{clientName}</p>
                <p className="text-stone-400 text-[10px] flex items-center gap-1.5 uppercase tracking-widest">
                  <Calendar size={12} />
                  {format(new Date(reservation.createdAt), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">STATUT</p>
                <p className="text-amber-700/60 font-serif text-xl italic capitalize">{reservation.statut.toLowerCase()}</p>
                <p className="text-stone-400 text-[10px]">Confirmation Digitale</p>
              </div>
            </div>

            <div className="h-[1px] w-full bg-stone-100 mb-10" />

            {/* Line Items */}
            <div className="space-y-8 mb-12">
              {reservation.lignes.map((ligne: any) => {
                const isRoom = !!ligne.chambre;
                const days = isRoom && ligne.dateArrivee && ligne.dateDepart 
                  ? differenceInDays(new Date(ligne.dateDepart), new Date(ligne.dateArrivee))
                  : 0;

                return (
                  <div key={ligne.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-amber-700/60 w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
                        {isRoom ? <Hotel size={20} /> : <Bus size={20} />}
                      </div>
                      <div>
                        <p className="text-stone-900 font-bold text-lg">
                          {isRoom ? `Chambre ${ligne.chambre.numero}` : `${ligne.trajet.lieuDepart} → ${ligne.trajet.lieuArrivee}`}
                        </p>
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                          {isRoom ? `${days} NUIT(S) HÔTELIER` : `${ligne.nombrePlaces} PLACE(S) ${ligne.trajet.typeTransport}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-stone-900 font-bold text-2xl tracking-tight">{ligne.prixTotal.toFixed(2)}€</p>
                  </div>
                );
              })}
            </div>

            {/* Badges / Amenities */}
            <div className="flex flex-wrap gap-2 mb-12">
              <div className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg flex items-center gap-2 text-stone-500 text-[9px] font-bold uppercase tracking-widest">
                <Wifi size={12} />
                FREE WIFI
              </div>
              <div className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg flex items-center gap-2 text-stone-500 text-[9px] font-bold uppercase tracking-widest">
                <Coffee size={12} />
                BREAKFAST
              </div>
              <div className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg flex items-center gap-2 text-stone-500 text-[9px] font-bold uppercase tracking-widest">
                <Shield size={12} />
                INSURANCE INCLUDED
              </div>
            </div>

            {/* Total & CTA */}
            <div className="mb-12">
              <div className="flex items-end gap-2 mb-6">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">TOTAL À RÉGLER</p>
                <p className="text-stone-900 font-bold text-4xl tracking-tight">{reservation.montantTotal.toFixed(2)}€</p>
              </div>
              {!isPaid && (
                <button
                  onClick={handlePayment}
                  className="w-full py-4 bg-[#1C1917] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-stone-900/10 active:scale-[0.98]"
                >
                  RÉGLEZ MAINTENANT
                </button>
              )}
            </div>

            {/* QR Stub Area */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[280px] bg-white border border-stone-200 rounded-[2rem] p-8 mb-6 group overflow-hidden">
                
                {/* Security Lock Icon */}
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-full ${isPaid ? 'bg-emerald-600' : 'bg-stone-900'} flex items-center justify-center text-white shadow-lg z-20 transition-colors duration-500`}>
                  {isPaid ? <Shield size={20} /> : <CreditCard size={20} />}
                </div>
                
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* The PROFESSIONAL BLUR EFFECT */}
                  {!isPaid && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-white/60 backdrop-blur-[12px] transition-all duration-500">
                      <div className="w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center mb-5 shadow-2xl border border-white/20">
                        <Shield size={24} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-stone-900 text-[10px] font-black uppercase tracking-[0.25em]">
                          Accès Verrouillé
                        </p>
                        <p className="text-stone-500 text-[9px] font-medium uppercase tracking-widest max-w-[140px] mx-auto leading-relaxed">
                          Paiement requis pour générer votre pass
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${id}&bgcolor=ffffff&color=1c1917`}
                    alt="QR Pass"
                    className={`w-full h-full transition-all duration-1000 ${!isPaid ? 'opacity-30 blur-[2px] grayscale' : 'scale-100'}`}
                  />
                </div>
              </div>

              <div className="text-center space-y-4 mb-10 w-full px-4">
                <p className="text-stone-400 text-[9px] font-bold uppercase tracking-[0.3em]">IDENTIFICATION PASSAGER</p>
                <div className="bg-stone-50 py-3 px-4 rounded-xl border border-stone-100">
                  <p className="text-stone-900 font-mono text-[9px] tracking-widest break-all uppercase">
                    {reservation.id}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-stone-400 text-[10px] font-medium tracking-wide">
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300'}`}>
                    {isPaid && <Shield size={10} />}
                  </div>
                  Mobile Onboarding • {isPaid ? 'Sécurisé' : 'En attente'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-stone-50 border-t border-stone-100 flex divide-x divide-stone-100">
            <button 
              onClick={() => window.print()}
              className="flex-1 py-5 flex items-center justify-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              <Download size={14} />
              EXPORTER PDF
            </button>
            <button className="flex-1 py-5 flex items-center justify-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-bold uppercase tracking-widest">
              <HelpCircle size={14} />
              ASSISTANCE
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}