"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
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
  Navigation,
  Globe,
  Wind,
  Compass,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { WorldMap } from "@/components/ui/WorldMap";
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
  TRAIN: "Ligne de Chemin de Fer",
  AVION: "Compagnie Aérienne Premium",
  BUS: "Ligne Routière Excellence",
  BATEAU: "Ligne Maritime Prestige",
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
        toast.error("Trajet non trouvé");
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
      toast.success("Réservation effectuée");
      router.push(`/payment/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de réservation");
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

  const Icon = TRANSPORT_ICONS[trajet.typeTransport] || Train;
  const dateDepart = new Date(trajet.dateDepart);
  const dateArrivee = new Date(trajet.dateArrivee);
  const dureeMins = Math.round((dateArrivee.getTime() - dateDepart.getTime()) / 60000);
  const heures = Math.floor(dureeMins / 60);
  const mins = dureeMins % 60;

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1C1917] pb-32">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────── */}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">{TRANSPORT_LABELS[trajet.typeTransport]}</p>
                    <p className="text-stone-400 text-xs font-medium">Référence : {id.slice(0, 8).toUpperCase()}</p>
                 </div>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-light text-stone-900">
                {trajet.lieuDepart} <span className="italic text-amber-800">→</span> {trajet.lieuArrivee}
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-900/5 min-w-[200px]"
            >
               <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Tarif Premium</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-5xl font-serif font-bold text-stone-900">{trajet.prixParPlace.toFixed(0)}</span>
                 <span className="text-xl italic text-amber-800 font-serif">€/place</span>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAP & DETAILS ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            {/* MAPCN INSPIRED WORLD MAP */}
            <WorldMap 
              dots={[
                {
                  start: { 
                    lat: 36.8065, 
                    lng: 10.1815, 
                    label: trajet.lieuDepart 
                  },
                  end: { 
                    lat: 35.8256, 
                    lng: 10.6084, 
                    label: trajet.lieuArrivee 
                  }
                }
              ]}
            />

            {/* ITINERARY LIST */}
            <div className="grid md:grid-cols-2 gap-8">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="bg-white p-10 rounded-[2.5rem] border border-stone-100 space-y-10"
               >
                  <h3 className="font-serif text-2xl text-stone-900">Programme</h3>
                  
                  <div className="relative space-y-12">
                    <div className="absolute left-6 top-2 bottom-2 w-[1px] bg-stone-100 border-l border-dashed border-stone-200" />
                    
                    <div className="relative flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center z-10 shadow-lg">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Départ</p>
                        <p className="text-xl font-serif font-bold text-stone-900">{format(dateDepart, "HH:mm")}</p>
                        <p className="text-xs text-stone-500 font-medium">{trajet.lieuDepart}</p>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center z-10 shadow-sm border border-amber-100">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Durée</p>
                        <p className="text-xl font-serif font-bold text-stone-900">{heures}h {mins}m</p>
                        <p className="text-xs text-stone-500 font-medium italic">Temps estimé</p>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-900 flex items-center justify-center z-10 shadow-sm border border-stone-100">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Arrivée</p>
                        <p className="text-xl font-serif font-bold text-stone-900">{format(dateArrivee, "HH:mm")}</p>
                        <p className="text-xs text-stone-500 font-medium">{trajet.lieuArrivee}</p>
                      </div>
                    </div>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 }}
                 className="bg-stone-900 p-10 rounded-[2.5rem] text-white space-y-10 relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-800/20 rounded-full blur-3xl -mr-32 -mt-32" />
                  
                  <h3 className="font-serif text-2xl relative z-10">Prestations Inclues</h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-800 transition-colors">
                         <Wind size={16} />
                       </div>
                       <div>
                         <p className="text-xs font-bold uppercase tracking-widest">Confort Climatisé</p>
                         <p className="text-[10px] text-stone-400">Température régulée</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-800 transition-colors">
                         <Shield size={16} />
                       </div>
                       <div>
                         <p className="text-xs font-bold uppercase tracking-widest">Assurance Premium</p>
                         <p className="text-[10px] text-stone-400">Protection voyageur complète</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-800 transition-colors">
                         <Compass size={16} />
                       </div>
                       <div>
                         <p className="text-xs font-bold uppercase tracking-widest">Guide Digital</p>
                         <p className="text-[10px] text-stone-400">Accès aux informations en temps réel</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 text-center">Véhicule Assigné</p>
                     <p className="text-center font-mono text-xs tracking-widest opacity-80">{trajet.numeroVehicule || "SÉLECTION EN COURS"}</p>
                  </div>
               </motion.div>
            </div>
          </div>

          {/* BOOKING COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:sticky lg:top-28 h-fit"
          >
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
               <h3 className="font-serif text-2xl text-stone-900 mb-8">Réservation</h3>
               
               <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 block">Nombre de Voyageurs</label>
                    <div className="flex items-center justify-between p-2 rounded-2xl bg-stone-50 border border-stone-100">
                      <button 
                        onClick={() => setNombrePlaces(Math.max(1, nombrePlaces - 1))}
                        className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-2xl font-serif font-bold text-stone-900">{nombrePlaces}</span>
                      <button 
                        onClick={() => setNombrePlaces(Math.min(trajet.placesDisponibles, nombrePlaces + 1))}
                        className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                       <span>Total par personne</span>
                       <span>{trajet.prixParPlace.toFixed(0)}€</span>
                     </div>
                     <div className="flex justify-between text-xl font-serif font-bold text-stone-900">
                       <span>Montant Global</span>
                       <span className="text-amber-800">{(trajet.prixParPlace * nombrePlaces).toFixed(2)}€</span>
                     </div>
                  </div>

                  <button 
                    onClick={handleReserve}
                    disabled={reserving || trajet.placesDisponibles < 1}
                    className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-amber-800 transition-all shadow-2xl shadow-stone-900/10 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {reserving ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirmer le Voyage
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                  
                  <div className="flex flex-col items-center gap-4 pt-4">
                     <div className="flex items-center gap-2 text-stone-300">
                       <Shield size={12} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Transaction Hautement Sécurisée</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}