"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

    // Store dates in localStorage or URL params for reservation page
    localStorage.setItem("reservationDates", JSON.stringify(selectedDates));
    localStorage.setItem("selectedRoomId", id);
    
    router.push(`/reservations/new?roomId=${id}&dateArrivee=${selectedDates.dateArrivee}&dateDepart=${selectedDates.dateDepart}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
          <div className="skeleton h-96 rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="skeleton h-12 w-3/4 mb-4" />
              <div className="skeleton h-6 w-1/2 mb-8" />
              <div className="skeleton h-32 w-full mb-6" />
            </div>
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="font-display text-2xl text-night-100 mb-4">Chambre non trouvée</h2>
            <button onClick={() => router.push("/rooms")} className="btn-gold">
              Retour aux chambres
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      
      <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
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
          {/* Left column - Room info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Title */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-sm">
                    Chambre {room.numero}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-night-800 text-night-300 text-sm">
                    {getTypeLabel(room.type)}
                  </span>
                  {room.disponible ? (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm flex items-center gap-1">
                      <CheckCircle size={12} /> Disponible
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center gap-1">
                      <XCircle size={12} /> Indisponible
                    </span>
                  )}
                </div>
                <h1 className="font-display text-4xl font-light text-night-50">
                  {room.type === "SIMPLE" && "Chambre Simple"}
                  {room.type === "DOUBLE" && "Chambre Double"}
                  {room.type === "SUITE" && "Suite"}
                  {room.type === "PENTHOUSE" && "Penthouse"}
                  {room.type === "FAMILIALE" && "Chambre Familiale"}
                </h1>
              </div>

              {/* Image placeholder - replace with actual image if available */}
              <div className="aspect-video bg-gradient-to-br from-gold-500/10 to-night-800 rounded-2xl overflow-hidden relative">
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
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gold-500/10 flex items-center justify-center">
                        <span className="text-4xl">🏨</span>
                      </div>
                      <p className="text-night-400">Image de la chambre</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="glass-card p-6">
                <h2 className="font-display text-xl text-night-100 mb-4">Description</h2>
                <p className="text-night-300 leading-relaxed">
                  {room.description || `Profitez de notre ${getTypeLabel(room.type).toLowerCase()} confortable et bien équipée. Idéale pour ${room.capacite} personne${room.capacite > 1 ? "s" : ""}, cette chambre vous offrira un séjour agréable dans un cadre élégant et apaisant.`}
                </p>
              </div>

              {/* Equipments */}
              {room.equipements && room.equipements.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-xl text-night-100 mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.equipements.map((equip) => (
                      <div key={equip} className="flex items-center gap-2 text-night-300">
                        {getEquipmentIcon(equip)}
                        <span>{equip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="glass-card p-6">
                <h2 className="font-display text-xl text-night-100 mb-4">Détails</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-night-500 text-sm">Capacité</p>
                    <p className="text-night-100 font-medium flex items-center gap-2 mt-1">
                      <Users size={16} className="text-gold-400" />
                      {room.capacite} personne{room.capacite > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-night-500 text-sm">Étage</p>
                    <p className="text-night-100 font-medium mt-1">{room.etage}</p>
                  </div>
                  <div>
                    <p className="text-night-500 text-sm">Numéro</p>
                    <p className="text-night-100 font-medium mt-1">{room.numero}</p>
                  </div>
                  <div>
                    <p className="text-night-500 text-sm">Type</p>
                    <p className="text-night-100 font-medium mt-1">{getTypeLabel(room.type)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Booking card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-28"
          >
            <div className="glass-card p-6">
              <div className="mb-6">
                <p className="text-night-500 text-sm mb-1">Prix par nuit</p>
                <p className="font-display text-4xl font-bold text-gold-400">
                  {room.prixParNuit}€
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-night-300 text-sm mb-2 flex items-center gap-2">
                    <Calendar size={14} />
                    Date d'arrivée
                  </label>
                  <input
                    type="date"
                    className="input-gold w-full"
                    value={selectedDates.dateArrivee}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setSelectedDates({ ...selectedDates, dateArrivee: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-night-300 text-sm mb-2 flex items-center gap-2">
                    <Calendar size={14} />
                    Date de départ
                  </label>
                  <input
                    type="date"
                    className="input-gold w-full"
                    value={selectedDates.dateDepart}
                    min={selectedDates.dateArrivee || new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setSelectedDates({ ...selectedDates, dateDepart: e.target.value })
                    }
                  />
                </div>
              </div>

              {selectedDates.dateArrivee && selectedDates.dateDepart && (
                <div className="p-4 rounded-xl bg-night-800 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-night-400">Prix par nuit</span>
                    <span className="text-night-100">{room.prixParNuit}€</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-night-400">Nombre de nuits</span>
                    <span className="text-night-100">
                      {Math.ceil(
                        (new Date(selectedDates.dateDepart).getTime() -
                          new Date(selectedDates.dateArrivee).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      nuits
                    </span>
                  </div>
                  <div className="border-t border-night-700 my-3" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-night-100">Total TTC</span>
                    <span className="text-gold-400 text-xl">
                      {Math.ceil(
                        (new Date(selectedDates.dateDepart).getTime() -
                          new Date(selectedDates.dateArrivee).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) * room.prixParNuit}€
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={!room.disponible}
                className={`btn-gold w-full justify-center ${!room.disponible && "opacity-50 cursor-not-allowed"}`}
              >
                {room.disponible ? "Réserver maintenant" : "Indisponible"}
              </button>

              <p className="text-night-500 text-xs text-center mt-4">
                Paiement sécurisé. Pas de frais cachés.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}