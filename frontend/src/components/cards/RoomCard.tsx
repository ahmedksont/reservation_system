"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Star, Users, Wifi, Wind, Coffee, Bath, ArrowRight, MapPin, BedDouble, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Chambre } from "@/types";

const equipmentIcons: Record<string, any> = {
  wifi: Wifi, 
  climatisation: Wind, 
  café: Coffee, 
  bain: Bath,
  "petit-déjeuner": Coffee,
  "vue mer": MapPin,
};

interface RoomCardProps {
  chambre: Chambre;
  dateArrivee?: string;
  dateDepart?: string;
  index?: number;
}

export default function RoomCard({ chambre, dateArrivee, dateDepart, index = 0 }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const typeLabels: Record<string, string> = {
    SIMPLE: "Chambre Simple", 
    DOUBLE: "Chambre Double",
    SUITE: "Suite Exclusive", 
    PENTHOUSE: "Penthouse Royal", 
    FAMILIALE: "Suite Familiale",
  };

  const params = new URLSearchParams();
  if (dateArrivee) params.set("dateArrivee", dateArrivee);
  if (dateDepart) params.set("dateDepart", dateDepart);

  const images = chambre.images || (chambre.imageUrl ? [chambre.imageUrl] : []);
  const hasMultipleImages = images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.05 }}
        whileHover={{ y: -10 }}
        className="bg-white rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-100"
      >
        <Link href={`/rooms/${chambre.id}?${params}`} className="block">
          {/* Image Container avec Carrousel */}
          <div className="relative h-72 overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`Chambre ${chambre.numero} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onClick={(e) => openModal(e, currentImageIndex)}
                />
                
                {/* Flèches de navigation (carrousel) */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
                
                {/* Indicateurs de pagination */}
                {hasMultipleImages && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? "bg-white w-4"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                <BedDouble size={48} className="text-stone-300" />
              </div>
            )}
            
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />
            
            {/* Price Tag */}
            <div className="absolute bottom-6 left-6 text-white pointer-events-none">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">À partir de</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold">{chambre.prixParNuit}TND</span>
                <span className="text-xs opacity-70">/ nuit</span>
              </div>
            </div>

            {/* Type Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white pointer-events-none">
              {typeLabels[chambre.type] || chambre.type}
            </div>

            {/* Rating */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-white text-xs font-bold">4.9</span>
            </div>

            {/* Indicateur nombre d'images */}
            {hasMultipleImages && (
              <div className="absolute top-6 right-20 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-white text-[10px] font-medium pointer-events-none">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl text-stone-900 group-hover:text-amber-700 transition-colors">
                Chambre {chambre.numero}
              </h3>
              <div className="flex items-center gap-1.5 text-stone-400 text-sm font-medium">
                <Users size={14} />
                <span>{chambre.capacite} pers.</span>
              </div>
            </div>

            <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-2 font-light">
              {chambre.description || "Un espace de raffinement absolu offrant une vue imprenable et des équipements de première classe pour un séjour inoubliable."}
            </p>

            {/* Equipments */}
            <div className="flex flex-wrap gap-2 mb-8">
              {chambre.equipements?.slice(0, 3).map((eq) => {
                const Icon = equipmentIcons[eq.toLowerCase()] || Wifi;
                return (
                  <div
                    key={eq}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400"
                  >
                    <Icon size={12} />
                    {eq}
                  </div>
                );
              })}
              {chambre.equipements && chambre.equipements.length > 3 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-bold text-stone-400">
                  +{chambre.equipements.length - 3}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Voir les détails</span>
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center transition-transform group-hover:translate-x-2 group-hover:bg-amber-600">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Modal plein écran pour visualiser les images */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>
            
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevModalImage(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); nextModalImage(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <img
              src={images[modalImageIndex]}
              alt={`Chambre ${chambre.numero} - ${modalImageIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Indicateurs dans le modal */}
            {hasMultipleImages && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setModalImageIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === modalImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Compteur d'images dans le modal */}
            {hasMultipleImages && (
              <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {modalImageIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}