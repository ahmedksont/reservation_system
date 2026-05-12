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
  Maximize2,
  ChevronLeft,
  Heart,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
    Balcon: MapPin,
    "Vue mer": MapPin,
    "Petit-déjeuner": Coffee,
    Coffre: Shield,
  };
  const Icon = iconMap[equip] || CheckCircle;
  return <Icon size={18} />;
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SIMPLE: "Chambre Simple",
    DOUBLE: "Chambre Double",
    SUITE: "Suite Exclusive",
    PENTHOUSE: "Penthouse Royal",
    FAMILIALE: "Chambre Familiale",
  };
  return labels[type] || type;
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Chambre | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    dateArrivee: "",
    dateDepart: "",
  });

  const id = params.id as string;

  // Récupérer toutes les images de la chambre
  const allImages = room?.images && room.images.length > 0 
    ? room.images 
    : room?.imageUrl 
      ? [room.imageUrl] 
      : ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200"];

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
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto space-y-8">
          <div className="h-96 bg-stone-100 rounded-[2.5rem] animate-pulse" />
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-12 bg-stone-100 rounded-2xl w-3/4 animate-pulse" />
              <div className="h-4 bg-stone-100 rounded-xl w-1/2 animate-pulse" />
              <div className="h-48 bg-stone-100 rounded-3xl animate-pulse" />
            </div>
            <div className="h-96 bg-stone-100 rounded-[2.5rem] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) return null;

  const nights = calculateNights();
  const total = calculateTotal();
  const hasMultipleImages = allImages.length > 1;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={14} />
                Retour à la collection
              </button>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {getTypeLabel(room.type)}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= 4 ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight">
                Chambre <span className="italic text-stone-400 font-light">{room.numero}</span>
              </h1>
              <div className="flex items-center gap-4 mt-4 text-stone-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>Étage {room.etage}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span>{room.capacite} personne{room.capacite > 1 ? "s" : ""}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center transition-all ${isLiked ? "bg-red-50 border-red-100 text-red-500" : "hover:bg-white hover:border-stone-400 text-stone-400"}`}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white hover:border-stone-400 text-stone-400 transition-all">
                <Share2 size={20} />
              </button>
            </motion.div>
          </div>

          {/* Gallery with Carrousel */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16"
          >
            {/* Main Image */}
            <div className="lg:col-span-3 relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={allImages[activeImage]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                  alt={`Chambre ${room.numero} - Image ${activeImage + 1}`}
                />
              </AnimatePresence>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent pointer-events-none" />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {hasMultipleImages && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`transition-all rounded-full ${
                        activeImage === i 
                          ? "w-2.5 h-2.5 bg-white" 
                          : "w-2 h-2 bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                  {activeImage + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="hidden lg:flex flex-col gap-4">
                {allImages.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-[calc((600px-48px)/3)] rounded-2xl overflow-hidden transition-all ${
                      activeImage === i 
                        ? "ring-2 ring-amber-500 shadow-lg" 
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover"
                      alt={`Thumbnail ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          {/* Grid Content */}
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-3xl text-stone-900 mb-6">À propos de cet espace</h2>
                <p className="text-stone-500 text-lg leading-relaxed font-light">
                  {room.description || "Immergez-vous dans un cocon de luxe et de sérénité. Cette chambre a été pensée pour les voyageurs en quête d'excellence, alliant design contemporain et confort traditionnel. Chaque matériau a été choisi avec soin pour créer une atmosphère apaisante et raffinée."}
                </p>
              </motion.div>

              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-3xl text-stone-900 mb-8">Ce que propose ce logement</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.equipements && room.equipements.length > 0 ? (
                    room.equipements.map((eq) => (
                      <div key={eq} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                          {getEquipmentIcon(eq)}
                        </div>
                        <span className="font-medium text-stone-700">{eq}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400">Aucun équipement spécifié</p>
                  )}
                </div>
              </motion.div>

              {/* Concierge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-stone-900 rounded-[2.5rem] p-10 text-white"
              >
                <h2 className="font-serif text-2xl mb-3">Besoin d'aide ?</h2>
                <p className="text-stone-400 mb-6 max-w-md">Notre conciergerie est à votre disposition 24/7 pour rendre votre séjour inoubliable.</p>
                <button className="px-6 py-3 bg-white text-stone-900 rounded-full font-medium text-sm hover:bg-amber-500 hover:text-white transition-all">
                  Contacter la réception
                </button>
              </motion.div>
            </div>

            {/* Booking Sidebar */}
            <motion.aside
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-32 h-fit"
            >
              <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl p-8">
                {/* Price */}
                <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-stone-100">
                  <div>
                    <span className="font-serif text-4xl font-bold text-stone-900">{room.prixParNuit} TND</span>
                    <span className="text-stone-400 text-sm ml-1">/ nuit</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold text-stone-700">4.9</span>
                  </div>
                </div>

                {/* Date Inputs */}
                <div className="space-y-4 mb-8">
                  <div className="p-4 border border-stone-200 rounded-xl">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">ARRIVÉE</label>
                    <input
                      type="date"
                      value={selectedDates.dateArrivee}
                      onChange={(e) => setSelectedDates(d => ({ ...d, dateArrivee: e.target.value }))}
                      className="w-full text-sm font-medium focus:outline-none bg-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="p-4 border border-stone-200 rounded-xl">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">DÉPART</label>
                    <input
                      type="date"
                      value={selectedDates.dateDepart}
                      onChange={(e) => setSelectedDates(d => ({ ...d, dateDepart: e.target.value }))}
                      className="w-full text-sm font-medium focus:outline-none bg-transparent"
                      min={selectedDates.dateArrivee || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Price Details */}
                {nights > 0 && (
                  <div className="space-y-3 mb-8 pt-4 border-t border-stone-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">{room.prixParNuit} TND × {nights} nuits</span>
                      <span className="font-medium text-stone-900">{total} TND</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">Frais de service</span>
                      <span className="font-medium text-stone-900">0 TND</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-stone-100">
                      <span className="font-bold text-stone-900">Total TTC</span>
                      <span className="font-serif text-2xl font-bold text-amber-600">{total} TND</span>
                    </div>
                  </div>
                )}

                {/* Reserve Button */}
                <button
                  onClick={handleReserve}
                  disabled={!room.disponible}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                    !room.disponible
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : "bg-stone-900 text-white hover:bg-amber-600 hover:shadow-lg"
                  }`}
                >
                  {room.disponible ? "Réserver maintenant" : "Indisponible"}
                </button>

                {/* Guarantee */}
                <div className="mt-6 flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                  <Shield size={18} className="text-amber-600" />
                  <p className="text-[11px] text-amber-800 font-medium">
                    Annulation gratuite jusqu'à 48h avant l'arrivée
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}