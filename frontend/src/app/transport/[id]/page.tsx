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
  ArrowRight,
  Minus,
  Plus,
  Shield,
  Navigation,
  Globe,
  Wind,
  Compass,
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
  TRAIN: "Ligne de Chemin de Fer Premium",
  AVION: "Compagnie Aérienne Excellence",
  BUS: "Transport Routier Prestige",
  BATEAU: "Navigation Maritime Grand Luxe",
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
        toast.error("Données de voyage indisponibles");
        router.push("/transport");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrajet();
  }, [id, router]);

  const handleReserve = async () => {
    if (!trajet) return;
    setReserving(true);
    try {
      const { data } = await reservationApi.create({
        trajetId: trajet.id,
        nombrePlaces: nombrePlaces,
        notes: `Réservation de ${nombrePlaces} place(s) : ${trajet.lieuDepart} → ${trajet.lieuArrivee}`,
      });
      toast.success("Réservation effectuée avec succès");
      router.push(`/payment/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la réservation");
    } finally {
      setReserving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDFDFC] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-stone-200 border-t-amber-800 rounded-full animate-spin" />
    </div>
  );

  if (!trajet) return null;

  const Icon = TRANSPORT_ICONS[trajet.typeTransport as keyof typeof TRANSPORT_ICONS] || Train;
  const dateDepart = new Date(trajet.dateDepart);
  const dateArrivee = new Date(trajet.dateArrivee);
  const dureeMins = Math.round((dateArrivee.getTime() - dateDepart.getTime()) / 60000);
  const heures = Math.floor(dureeMins / 60);
  const mins = dureeMins % 60;

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1C1917] pb-32">
      <Navbar />

      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-3 text-stone-400 hover:text-amber-800 transition-all mb-12 text-[10px] font-black uppercase tracking-[0.2em] group"
          >
            <div className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all">
              <ArrowLeft size={14} />
            </div>
            Retour aux lignes
          </motion.button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-sm">
                   <Icon size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">{TRANSPORT_LABELS[trajet.typeTransport as keyof typeof TRANSPORT_LABELS] || trajet.typeTransport}</p>
                    <p className="text-stone-400 text-xs font-medium font-mono uppercase">VÉHICULE : {trajet.numeroVehicule || "SANS RÉFÉRENCE"}</p>
                 </div>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-light text-stone-900 capitalize">
                {trajet.lieuDepart} <span className="italic text-amber-800">→</span> {trajet.lieuArrivee}
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-900/5 min-w-[200px]"
            >
               <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Tarif Voyageur</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-5xl font-serif font-bold text-stone-900">{trajet.prixParPlace.toFixed(2)}</span>
                 <span className="text-xl italic text-amber-800 font-serif">€</span>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-[21/9] bg-stone-50 rounded-[3rem] overflow-hidden border border-stone-100 shadow-inner group"
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <Globe size={800} className="absolute -top-1/2 -left-1/4 text-stone-900" strokeWidth={0.5} />
              </div>

              <svg className="absolute inset-0 w-full h-full p-20" viewBox="0 0 800 200" fill="none">
                 <path d="M 100 100 Q 400 0 700 100" stroke="#E7E5E4" strokeWidth="2" strokeDasharray="8 8" />
                 <motion.path d="M 100 100 Q 400 0 700 100" stroke="#92400E" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }} />
                 <circle cx="100" cy="100" r="6" fill="#1C1917" />
                 <circle cx="700" cy="100" r="6" fill="#92400E" />
                 <motion.g initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }} style={{ offsetPath: "path('M 100 100 Q 400 0 700 100')", offsetRotate: "auto 90deg" }}>
                   <circle r="15" fill="white" className="shadow-lg" />
                   <g transform="translate(-8, -8)">
                     <Icon size={16} className="text-amber-800" />
                   </g>
                 </motion.g>
              </svg>

              <div className="absolute top-8 left-8 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-900">SUIVI TEMPS RÉEL</span>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white p-10 rounded-[2.5rem] border border-stone-100 space-y-10">
                  <h3 className="font-serif text-2xl text-stone-900">Itinéraire</h3>
                  <div className="relative space-y-12">
                    <div className="absolute left-6 top-2 bottom-2 w-[1px] bg-stone-100 border-l border-dashed border-stone-200" />
                    <div className="relative flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center z-10 shadow-lg"><Navigation size={18} /></div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Départ</p>
                        <p className="text-xl font-serif font-bold text-stone-900 capitalize">{format(dateDepart, "HH:mm")}</p>
                        <p className="text-xs text-stone-500 font-medium capitalize">{trajet.lieuDepart}</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center z-10 shadow-sm border border-amber-100"><Clock size={18} /></div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Durée du trajet</p>
                        <p className="text-xl font-serif font-bold text-stone-900">{heures}h {mins}m</p>
                        <p className="text-xs text-stone-500 font-medium italic">Estimation précise</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-900 flex items-center justify-center z-10 shadow-sm border border-stone-100"><MapPin size={18} /></div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Arrivée</p>
                        <p className="text-xl font-serif font-bold text-stone-900 capitalize">{format(dateArrivee, "HH:mm")}</p>
                        <p className="text-xs text-stone-500 font-medium capitalize">{trajet.lieuArrivee}</p>
                      </div>
                    </div>
                  </div>
               </motion.div>

               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-stone-900 p-10 rounded-[2.5rem] text-white space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-800/20 rounded-full blur-3xl -mr-32 -mt-32" />
                  <h3 className="font-serif text-2xl relative z-10">Services à bord</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-800 transition-colors"><Wind size={16} /></div>
                       <div><p className="text-xs font-bold uppercase tracking-widest">Confort Premium</p><p className="text-[10px] text-stone-400">Équipements de dernière génération</p></div>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-800 transition-colors"><Shield size={16} /></div>
                       <div><p className="text-xs font-bold uppercase tracking-widest">Garantie Voyageur</p><p className="text-[10px] text-stone-400">Sécurité et assistance 24/7</p></div>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-800 transition-colors"><Compass size={16} /></div>
                       <div><p className="text-xs font-bold uppercase tracking-widest">Navigation Temps Réel</p><p className="text-[10px] text-stone-400">Suivi précis via GPS</p></div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 text-center">Référence Véhicule</p>
                     <p className="text-center font-mono text-xs tracking-widest opacity-80 uppercase">{trajet.numeroVehicule || "IDENTIFICATION EN COURS"}</p>
                  </div>
               </motion.div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
               <h3 className="font-serif text-2xl text-stone-900 mb-8">Réservation</h3>
               <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 block">Nombre de Places</label>
                    <div className="flex items-center justify-between p-2 rounded-2xl bg-stone-50 border border-stone-100">
                      <button onClick={() => setNombrePlaces(Math.max(1, nombrePlaces - 1))} className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-sm active:scale-95"><Minus size={16} /></button>
                      <span className="text-2xl font-serif font-bold text-stone-900">{nombrePlaces}</span>
                      <button onClick={() => setNombrePlaces(Math.min(trajet.placesDisponibles, nombrePlaces + 1))} className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-sm active:scale-95"><Plus size={16} /></button>
                    </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400"><span>Prix Unitaire</span><span>{trajet.prixParPlace.toFixed(2)}€</span></div>
                     <div className="flex justify-between text-xl font-serif font-bold text-stone-900"><span>Montant Total</span><span className="text-amber-800">{(trajet.prixParPlace * nombrePlaces).toFixed(2)}€</span></div>
                  </div>
                  <button onClick={handleReserve} disabled={reserving || trajet.placesDisponibles < 1} className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-amber-800 transition-all shadow-2xl shadow-stone-900/10 active:scale-[0.98] flex items-center justify-center gap-3">
                    {reserving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Réserver ce Voyage<ArrowRight size={14} /></>}
                  </button>
                  <div className="flex flex-col items-center gap-4 pt-4"><div className="flex items-center gap-2 text-stone-300"><Shield size={12} /><span className="text-[9px] font-bold uppercase tracking-widest">Réservation Instantanée & Sécurisée</span></div></div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}