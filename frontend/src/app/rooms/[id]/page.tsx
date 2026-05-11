"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Bath,
  Dumbbell,
  Car,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  Shield,
  Bed,
  Home,
  Star,
  MapPin,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { chambreApi } from "@/lib/api";
import type { Chambre } from "@/types";
import toast from "react-hot-toast";

const getEquipmentIcon = (equip: string) => {
  const iconMap: Record<string, any> = {
    WiFi: Wifi,
    Wifi: Wifi,
    TV: Tv,
    Climatisation: Wind,
    "Mini-bar": Coffee,
    Baignoire: Bath,
    Douche: Bath,
    Balcon: Car,
    "Vue mer": Car,
    "Petit-déjeuner": Coffee,
    Coffre: Dumbbell,
  };
  const Icon = iconMap[equip] || CheckCircle;
  return <Icon size={16} />;
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SIMPLE: "Simple",
    DOUBLE: "Double",
    SUITE: "Suite",
    PENTHOUSE: "Penthouse",
    FAMILIALE: "Familiale",
  };
  return labels[type] || type;
};

const ROOM_TYPE_STYLES: Record<string, { bg: string; border: string; text: string; icon: string; accent: string }> = {
  SIMPLE: { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-700", icon: "text-stone-500", accent: "bg-stone-100" },
  DOUBLE: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500", accent: "bg-emerald-100" },
  SUITE: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500", accent: "bg-amber-100" },
  PENTHOUSE: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", icon: "text-sky-500", accent: "bg-sky-100" },
  FAMILIALE: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-500", accent: "bg-indigo-100" },
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Chambre | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({
    dateArrivee: "",
    dateDepart: "",
  });

  const id = params.id as string;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const { data } = await chambreApi.getById(id);
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room:", error);
        toast.error("Chambre non trouvée");
        router.push("/rooms");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id, router]);

  const handleReserve = () => {
    if (!selectedDates.dateArrivee || !selectedDates.dateDepart) {
      toast.error("Veuillez sélectionner les dates");
      return;
    }

    const arrivee = new Date(selectedDates.dateArrivee);
    const depart = new Date(selectedDates.dateDepart);

    if (depart <= arrivee) {
      toast.error("La date de départ doit être après la date d'arrivée");
      return;
    }

    localStorage.setItem("reservationDates", JSON.stringify(selectedDates));
    localStorage.setItem("selectedRoomId", id);

    router.push(`/reservations/new?roomId=${id}&dateArrivee=${selectedDates.dateArrivee}&dateDepart=${selectedDates.dateDepart}`);
  };

  const calculateNights = () => {
    if (!selectedDates.dateArrivee || !selectedDates.dateDepart) return 0;
    const arrivee = new Date(selectedDates.dateArrivee);
    const depart = new Date(selectedDates.dateDepart);
    return Math.max(0, Math.ceil((depart.getTime() - arrivee.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateTotal = () => {
    if (!room) return 0;
    return calculateNights() * Number(room.prixParNuit);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-200/80 h-96 animate-pulse mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-12 bg-stone-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-stone-200 rounded w-1/2 animate-pulse" />
              <div className="h-32 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl border border-stone-200/80 h-96 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
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
              <Bed size={24} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Chambre non trouvée</h2>
            <p className="text-stone-500 text-sm mb-6">La chambre que vous recherchez n'existe pas ou a été supprimée.</p>
            <button
              onClick={() => router.push("/rooms")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
            >
              Retour aux chambres
              <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const styles = ROOM_TYPE_STYLES[room.type] || ROOM_TYPE_STYLES.SIMPLE;
  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-amber-100/25 blur-[100px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-sky-50/40 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-700 transition mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Retour aux chambres
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${styles.bg} ${styles.text} border ${styles.border}`}>
                <Home size={12} />
                Chambre {room.numero}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${styles.bg} ${styles.text} border ${styles.border}`}>
                <Bed size={12} />
                {getTypeLabel(room.type)}
              </span>
              {room.disponible ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle size={12} /> Disponible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                  <XCircle size={12} /> Indisponible
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 mb-4 leading-tight">
              {room.type === "SIMPLE" && "Chambre Simple"}
              {room.type === "DOUBLE" && "Chambre Double"}
              {room.type === "SUITE" && "Suite"}
              {room.type === "PENTHOUSE" && "Penthouse"}
              {room.type === "FAMILIALE" && "Chambre Familiale"}
            </h1>
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <MapPin size={14} />
              <span>Étage {room.etage}</span>
              <span className="text-stone-300">·</span>
              <span>{room.capacite} personne{room.capacite > 1 ? "s" : ""}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Room info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
            >
              <div className="aspect-video relative bg-gradient-to-br from-stone-100 to-stone-50">
                {room.imageUrl ? (
                  <Image
                    src={room.imageUrl}
                    alt={`Chambre ${room.numero}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                        <Bed size={40} className="text-stone-300" />
                      </div>
                      <p className="text-stone-400 font-medium">Image de la chambre</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
            >
              <h2 className="font-serif text-xl text-stone-900 mb-4">Description</h2>
              <p className="text-stone-600 leading-relaxed">
                {room.description || `Profitez de notre ${getTypeLabel(room.type).toLowerCase()} confortable et bien équipée. Idéale pour ${room.capacite} personne${room.capacite > 1 ? "s" : ""}, cette chambre vous offrira un séjour agréable dans un cadre élégant et apaisant.`}
              </p>
            </motion.div>

            {/* Equipments */}
            {room.equipements && room.equipements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
              >
                <h2 className="font-serif text-xl text-stone-900 mb-6">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.equipements.map((equip) => (
                    <div key={equip} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="text-stone-500">
                        {getEquipmentIcon(equip)}
                      </div>
                      <span className="text-stone-700 text-sm font-medium">{equip}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300"
            >
              <h2 className="font-serif text-xl text-stone-900 mb-6">Détails</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Capacité</p>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-stone-500" />
                    <span className="text-stone-900 font-medium">{room.capacite} personne{room.capacite > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Étage</p>
                  <span className="text-stone-900 font-medium">{room.etage}</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Numéro</p>
                  <span className="text-stone-900 font-medium font-mono">{room.numero}</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Type</p>
                  <span className="text-stone-900 font-medium">{getTypeLabel(room.type)}</span>
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
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Prix par nuit</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-semibold text-stone-900">
                    {Number(room.prixParNuit).toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Date selectors */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-2">
                    <Calendar size={12} />
                    Date d'arrivée
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 transition-colors">
                    <input
                      type="date"
                      className="bg-transparent text-sm font-medium text-stone-800 focus:outline-none w-full"
                      value={selectedDates.dateArrivee}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setSelectedDates({ ...selectedDates, dateArrivee: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-2">
                    <Calendar size={12} />
                    Date de départ
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 transition-colors">
                    <input
                      type="date"
                      className="bg-transparent text-sm font-medium text-stone-800 focus:outline-none w-full"
                      value={selectedDates.dateDepart}
                      min={selectedDates.dateArrivee || new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setSelectedDates({ ...selectedDates, dateDepart: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <AnimatePresence>
                {nights > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 mb-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">{Number(room.prixParNuit).toFixed(2)}€ × {nights} nuit{nights > 1 ? "s" : ""}</span>
                        <span className="text-stone-700 font-medium">{total.toFixed(2)}€</span>
                      </div>
                      <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                        <span className="text-stone-900 font-semibold">Total TTC</span>
                        <span className="font-serif text-2xl font-semibold text-amber-700">
                          {total.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <button
                onClick={handleReserve}
                disabled={!room.disponible}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                  !room.disponible
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20"
                }`}
              >
                {!room.disponible ? (
                  "Indisponible"
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
                <span>Paiement sécurisé · Pas de frais cachés</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}