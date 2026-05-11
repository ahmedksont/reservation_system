"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Hotel, Train, MapPin, Calendar, Users, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Tab = "hotel" | "transport";

export default function SearchBar() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hotel");
  const [hotelForm, setHotelForm] = useState({
    destination: "", dateArrivee: "", dateDepart: "", personnes: 1,
  });
  const [transportForm, setTransportForm] = useState({
    depart: "", arrivee: "", date: "", places: 1,
  });

  const handleHotelSearch = () => {
    const params = new URLSearchParams({
      destination: hotelForm.destination,
      dateArrivee: hotelForm.dateArrivee,
      dateDepart: hotelForm.dateDepart,
      capacite: String(hotelForm.personnes),
    });
    router.push(`/rooms?${params}`);
  };

  const handleTransportSearch = () => {
    const params = new URLSearchParams({
      depart: transportForm.depart,
      arrivee: transportForm.arrivee,
      date: transportForm.date,
      places: String(transportForm.places),
    });
    router.push(`/transport?${params}`);
  };

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl overflow-hidden"
      style={{
        background: "rgba(26,23,20,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(251,191,36,0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Tabs */}
      <div className="flex border-b border-night-800/80">
        {([
          { key: "hotel", label: "Hôtel", icon: Hotel },
          { key: "transport", label: "Transport", icon: Train },
        ] as { key: Tab; label: string; icon: typeof Hotel }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-2.5 flex-1 py-4 px-6 text-sm font-medium transition-all ${
              tab === key ? "text-gold-400" : "text-night-400 hover:text-night-200"
            }`}
          >
            <Icon size={16} />
            {label}
            {tab === key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {tab === "hotel" ? (
            <motion.div
              key="hotel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="md:col-span-1">
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Destination</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input
                    type="text"
                    placeholder="Paris, Rome..."
                    className="input-gold pl-9"
                    value={hotelForm.destination}
                    onChange={e => setHotelForm(f => ({ ...f, destination: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Arrivée</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input
                    type="date"
                    className="input-gold pl-9"
                    value={hotelForm.dateArrivee}
                    onChange={e => setHotelForm(f => ({ ...f, dateArrivee: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Départ</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input
                    type="date"
                    className="input-gold pl-9"
                    value={hotelForm.dateDepart}
                    onChange={e => setHotelForm(f => ({ ...f, dateDepart: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Personnes</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="input-gold pl-9"
                    value={hotelForm.personnes}
                    onChange={e => setHotelForm(f => ({ ...f, personnes: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="transport"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Départ</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input type="text" placeholder="Lyon" className="input-gold pl-9"
                    value={transportForm.depart}
                    onChange={e => setTransportForm(f => ({ ...f, depart: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Arrivée</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input type="text" placeholder="Paris" className="input-gold pl-9"
                    value={transportForm.arrivee}
                    onChange={e => setTransportForm(f => ({ ...f, arrivee: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Date</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input type="date" className="input-gold pl-9"
                    value={transportForm.date}
                    onChange={e => setTransportForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-night-400 text-xs uppercase tracking-widest mb-2 block">Places</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500" />
                  <input type="number" min={1} max={20} className="input-gold pl-9"
                    value={transportForm.places}
                    onChange={e => setTransportForm(f => ({ ...f, places: Number(e.target.value) }))} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={tab === "hotel" ? handleHotelSearch : handleTransportSearch}
            className="btn-gold px-8 py-3 text-base"
          >
            <Search size={17} />
            Rechercher
          </motion.button>
        </div>
      </div>
    </div>
  );
}
