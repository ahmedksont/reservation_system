"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Hotel,
  Bus,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  isWithinInterval
} from "date-fns";
import { fr } from "date-fns/locale";
import { adminApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Reservation {
  id: string;
  client: {
    nom: string;
    prenom: string;
    email: string;
  };
  statut: string;
  statutPaiement: string;
  montantTotal: number;
  createdAt: string;
  lignes: any[];
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getAllReservations();
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Erreur de chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif text-stone-900 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <p className="text-stone-500 text-sm">Aperçu mensuel des réservations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-stone-400 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 border-t border-l border-stone-100 rounded-2xl overflow-hidden">
        {calendarDays.map((day, idx) => {
          const dayReservations = reservations.filter((res) => {
            const resDate = parseISO(res.createdAt);
            return isSameDay(resDate, day);
          });

          return (
            <div
              key={day.toString()}
              className={`min-h-[120px] p-2 border-r border-b border-stone-100 transition-colors ${
                !isSameMonth(day, monthStart) ? "bg-stone-50/50" : "bg-white"
              } ${isSameDay(day, new Date()) ? "bg-amber-50/30" : ""}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-medium ${
                  !isSameMonth(day, monthStart) ? "text-stone-300" : "text-stone-500"
                } ${isSameDay(day, new Date()) ? "text-amber-700 font-bold" : ""}`}>
                  {format(day, "d")}
                </span>
                {dayReservations.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] flex items-center justify-center font-bold">
                    {dayReservations.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayReservations.slice(0, 3).map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setSelectedReservation(res)}
                    className="w-full text-left p-1.5 rounded-lg bg-stone-900 text-white text-[9px] truncate hover:bg-stone-800 transition-all shadow-sm"
                  >
                    {res.client.prenom} {res.client.nom}
                  </button>
                ))}
                {dayReservations.length > 3 && (
                  <p className="text-[9px] text-stone-400 text-center font-medium">
                    + {dayReservations.length - 3} autres
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      <AnimatePresence>
        {selectedReservation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      selectedReservation.statutPaiement === 'PAYE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {selectedReservation.statutPaiement === 'PAYE' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {selectedReservation.statutPaiement === 'PAYE' ? 'Billet Validé' : 'Paiement Requis'}
                    </span>
                    <h3 className="font-serif text-3xl text-stone-900">Détails Réservation</h3>
                    <p className="text-stone-400 text-xs mt-1">ID: #{selectedReservation.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Voyageur</p>
                      <p className="text-stone-900 font-bold text-lg">{selectedReservation.client.prenom} {selectedReservation.client.nom}</p>
                      <p className="text-stone-500 text-xs">{selectedReservation.client.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-2 text-stone-400 mb-1">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                      </div>
                      <p className="text-stone-900 font-bold">
                        {format(parseISO(selectedReservation.createdAt), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-2 text-stone-400 mb-1">
                        <Hotel size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Total</span>
                      </div>
                      <p className="text-stone-900 font-bold">{selectedReservation.montantTotal.toFixed(2)} TND</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Contenu du pass</p>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                      {selectedReservation.lignes.map((ligne: any) => (
                        <div key={ligne.id} className="flex items-center justify-between p-3 bg-white border border-stone-100 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3">
                            {ligne.chambre ? (
                              <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-amber-600 border border-stone-100">
                                <Hotel size={16} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-amber-600 border border-stone-100">
                                <Bus size={16} />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-stone-900">
                                {ligne.chambre ? `Chambre ${ligne.chambre.numero}` : `${ligne.trajet.lieuDepart} → ${ligne.trajet.lieuArrivee}`}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {ligne.chambre ? ligne.chambre.type : `${ligne.trajet.typeTransport} • ${ligne.nombrePlaces} place(s)`}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-stone-900">{ligne.prixTotal.toFixed(2)} TND</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/reservations/${selectedReservation.id}`);
                      toast.success("Lien copié");
                    }}
                    className="flex-1 py-4 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-50 transition active:scale-[0.98]"
                  >
                    Partager
                  </button>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition shadow-lg active:scale-[0.98]"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
