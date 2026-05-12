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

  // Mock additional images for gallery if not provided by backend
  const galleryImages = room?.imageUrl
    ? [room.imageUrl, "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000"]
    : ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000"];

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

          {/* Gallery */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16"
          >
            <div className="lg:col-span-3 relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={galleryImages[activeImage]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover"
                  alt="Room View"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${activeImage === i ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev + 1) % galleryImages.length)}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="hidden lg:grid grid-rows-3 gap-6">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative rounded-3xl overflow-hidden group border-4 transition-all ${activeImage === i ? "border-amber-500 shadow-xl" : "border-transparent hover:border-white/50"}`}
                >
                  <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Thumbnail" />
                  <div className={`absolute inset-0 bg-stone-900/20 transition-opacity ${activeImage === i ? "opacity-0" : "opacity-40 group-hover:opacity-20"}`} />
                </button>
              ))}
            </div>
          </motion.section>

          {/* Grid Content */}
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-3xl text-stone-900 mb-8">Ce que propose ce logement</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {room.equipements?.map((eq) => (
                    <div key={eq} className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                        {getEquipmentIcon(eq)}
                      </div>
                      <span className="font-medium text-stone-700">{eq}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h2 className="font-serif text-3xl mb-4">Besoin d'aide ?</h2>
                  <p className="text-stone-400 mb-8 max-w-md">Notre conciergerie est à votre disposition 24/7 pour rendre votre séjour inoubliable.</p>
                  <button className="px-8 py-4 bg-white text-stone-900 rounded-full font-bold text-sm hover:bg-amber-500 hover:text-white transition-all shadow-xl">
                    Contacter la réception
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
              </motion.div>
            </div>

            {/* Booking Sidebar */}
            <motion.aside
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-32 h-fit"
            >
              <div className="bg-white rounded-[3rem] border border-stone-100 shadow-2xl p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />

                <div className="flex items-baseline justify-between mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-bold text-stone-900">{room.prixParNuit}€</span>
                    <span className="text-stone-400 text-sm">/ nuit</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star size={14} fill="currentColor" />
                    <span>4.9</span>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="grid grid-cols-2 gap-px bg-stone-200 rounded-3xl border border-stone-200 overflow-hidden">
                    <div className="bg-white p-5 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Arrivée</label>
                      <input
                        type="date"
                        value={selectedDates.dateArrivee}
                        onChange={(e) => setSelectedDates(d => ({ ...d, dateArrivee: e.target.value }))}
                        className="w-full text-sm font-bold focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="bg-white p-5 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Départ</label>
                      <input
                        type="date"
                        value={selectedDates.dateDepart}
                        onChange={(e) => setSelectedDates(d => ({ ...d, dateDepart: e.target.value }))}
                        className="w-full text-sm font-bold focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                </div>

                {nights > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-10 space-y-4 pt-6 border-t border-stone-50"
                  >
                    <div className="flex justify-between text-stone-500 text-sm">
                      <span>{room.prixParNuit}€ x {nights} nuits</span>
                      <span className="font-bold text-stone-900">{total}€</span>
                    </div>
                    <div className="flex justify-between text-stone-500 text-sm">
                      <span>Frais de service</span>
                      <span className="font-bold text-stone-900">0€</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                      <span className="font-bold text-stone-900">Total</span>
                      <span className="font-serif text-3xl font-bold text-amber-600">{total}€</span>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleReserve}
                  disabled={!room.disponible}
                  className={`w-full py-5 rounded-2xl font-bold text-sm transition-all shadow-xl active:scale-[0.98] ${!room.disponible
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : "bg-stone-900 text-white hover:bg-amber-600 shadow-stone-900/20"
                    }`}
                >
                  {room.disponible ? "Réserver maintenant" : "Indisponible"}
                </button>

                <p className="text-center text-[10px] text-stone-400 mt-6 uppercase tracking-widest font-bold">
                  Aucun montant ne sera débité pour l'instant
                </p>
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                  <Shield size={20} />
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  Garantie du meilleur prix et annulation gratuite jusqu'à 48h avant l'arrivée.
                </p>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}