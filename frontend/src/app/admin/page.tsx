"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  Hotel,
  BarChart3,
  RefreshCw,
  Plane,
  Trash2,
  Pencil,
  Plus,
  X,
  Bus,
  Train,
  Ship,
  PlaneLanding,
  Wifi,
  Tv,
  Coffee,
  Dumbbell,
  Wind,
  Car,
  Bath,
  Check,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { adminApi } from "@/lib/api";
import type { AdminStats, Chambre, Trajet } from "@/types";
import toast from "react-hot-toast";

// Types
interface ChambreFormData {
  numero: string;
  type: string;
  prixParNuit: number;
  description: string;
  capacite: number;
  etage: number;
  imageUrl: string;
  equipements: string[];
}

interface TrajetFormData {
  lieuDepart: string;
  lieuArrivee: string;
  dateDepart: string;
  dateArrivee: string;
  typeTransport: string;
  prixParPlace: number;
  placesTotal: number;
  numeroVehicule: string;
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto glass-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-night-800 bg-night-950/95 backdrop-blur-sm z-10">
            <h2 className="font-display text-2xl text-night-100">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-night-700 hover:border-gold-500 text-night-300 hover:text-gold-400 transition flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Trajets CRUD Component
function TrajetsTable() {
  const [trajets, setTrajets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrajet, setEditingTrajet] = useState<any | null>(null);
  const [formData, setFormData] = useState<TrajetFormData>({
    lieuDepart: "",
    lieuArrivee: "",
    dateDepart: "",
    dateArrivee: "",
    typeTransport: "BUS",
    prixParPlace: 0,
    placesTotal: 1,
    numeroVehicule: "",
  });

  const fetchTrajets = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getTrajets();
      setTrajets(data.content || []);
    } catch {
      toast.error("Erreur chargement trajets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrajet) {
        await adminApi.updateTrajet(editingTrajet.id, formData);
        toast.success("Trajet modifié");
      } else {
        await adminApi.createTrajet(formData);
        toast.success("Trajet créé");
      }
      setModalOpen(false);
      setEditingTrajet(null);
      resetForm();
      fetchTrajets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const deleteTrajet = async (id: string) => {
    if (!confirm("Supprimer ce trajet ?")) return;
    try {
      await adminApi.deleteTrajet(id);
      toast.success("Trajet supprimé");
      fetchTrajets();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const openEditModal = (trajet: any) => {
    setEditingTrajet(trajet);
    setFormData({
      lieuDepart: trajet.lieuDepart,
      lieuArrivee: trajet.lieuArrivee,
      dateDepart: trajet.dateDepart.slice(0, 16),
      dateArrivee: trajet.dateArrivee.slice(0, 16),
      typeTransport: trajet.typeTransport,
      prixParPlace: trajet.prixParPlace,
      placesTotal: trajet.placesTotal,
      numeroVehicule: trajet.numeroVehicule || "",
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      lieuDepart: "",
      lieuArrivee: "",
      dateDepart: "",
      dateArrivee: "",
      typeTransport: "BUS",
      prixParPlace: 0,
      placesTotal: 1,
      numeroVehicule: "",
    });
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "BUS": return <Bus size={16} />;
      case "TRAIN": return <Train size={16} />;
      case "AVION": return <PlaneLanding size={16} />;
      case "BATEAU": return <Ship size={16} />;
      default: return <Car size={16} />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl text-night-100">Gestion des trajets</h2>
          <p className="text-night-500 text-sm mt-1">Créer, modifier et supprimer les trajets</p>
        </div>
        <button
          onClick={() => {
            setEditingTrajet(null);
            resetForm();
            setModalOpen(true);
          }}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus size={16} />
          Nouveau trajet
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-night-800 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-night-900">
            <tr className="text-left">
              <th className="p-4 text-night-400 font-medium">Départ</th>
              <th className="p-4 text-night-400 font-medium">Arrivée</th>
              <th className="p-4 text-night-400 font-medium">Transport</th>
              <th className="p-4 text-night-400 font-medium">Date départ</th>
              <th className="p-4 text-night-400 font-medium">Prix</th>
              <th className="p-4 text-night-400 font-medium">Places</th>
              <th className="p-4 text-night-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trajets.map((trajet) => (
              <tr key={trajet.id} className="border-t border-night-800 hover:bg-night-900/40 transition">
                <td className="p-4 text-night-100 font-medium">{trajet.lieuDepart}</td>
                <td className="p-4 text-night-100">{trajet.lieuArrivee}</td>
                <td className="p-4">
                  <span className="flex items-center gap-2 text-night-300">
                    {getTransportIcon(trajet.typeTransport)}
                    {trajet.typeTransport}
                  </span>
                </td>
                <td className="p-4 text-night-300 text-sm">
                  {new Date(trajet.dateDepart).toLocaleString('fr-FR')}
                </td>
                <td className="p-4 text-gold-400 font-medium">{trajet.prixParPlace}€</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    trajet.placesDisponibles > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trajet.placesDisponibles}/{trajet.placesTotal}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(trajet)}
                      className="w-9 h-9 rounded-lg border border-night-700 hover:border-gold-500 text-night-300 hover:text-gold-400 transition flex items-center justify-center"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteTrajet(trajet.id)}
                      className="w-9 h-9 rounded-lg border border-night-700 hover:border-red-500 text-night-300 hover:text-red-400 transition flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && trajets.length === 0 && (
          <div className="p-10 text-center text-night-500">Aucun trajet disponible</div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTrajet ? "Modifier le trajet" : "Créer un trajet"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-night-300 text-sm mb-2">Lieu départ *</label>
              <input
                type="text"
                required
                value={formData.lieuDepart}
                onChange={(e) => setFormData({ ...formData, lieuDepart: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Lieu arrivée *</label>
              <input
                type="text"
                required
                value={formData.lieuArrivee}
                onChange={(e) => setFormData({ ...formData, lieuArrivee: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
                placeholder="Lyon"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Date départ *</label>
              <input
                type="datetime-local"
                required
                value={formData.dateDepart}
                onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Date arrivée *</label>
              <input
                type="datetime-local"
                required
                value={formData.dateArrivee}
                onChange={(e) => setFormData({ ...formData, dateArrivee: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Type transport *</label>
              <select
                required
                value={formData.typeTransport}
                onChange={(e) => setFormData({ ...formData, typeTransport: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              >
                <option value="BUS">BUS</option>
                <option value="TRAIN">TRAIN</option>
                <option value="AVION">AVION</option>
                <option value="BATEAU">BATEAU</option>
              </select>
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Prix par place (€) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.prixParPlace}
                onChange={(e) => setFormData({ ...formData, prixParPlace: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Places totales *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.placesTotal}
                onChange={(e) => setFormData({ ...formData, placesTotal: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Numéro véhicule</label>
              <input
                type="text"
                value={formData.numeroVehicule}
                onChange={(e) => setFormData({ ...formData, numeroVehicule: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
                placeholder="AB-123-CD"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1 py-2">
              {editingTrajet ? "Modifier" : "Créer"}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1 py-2">
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Chambres CRUD Component
function ChambresTable() {
  const [chambres, setChambres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChambre, setEditingChambre] = useState<any | null>(null);
  const [formData, setFormData] = useState<ChambreFormData>({
    numero: "",
    type: "SIMPLE",
    prixParNuit: 0,
    description: "",
    capacite: 1,
    etage: 1,
    imageUrl: "",
    equipements: [],
  });
  const [equipementInput, setEquipementInput] = useState("");

  const availableEquipments = ["WiFi", "TV", "Climatisation", "Mini-bar", "Coffre-fort", "Baignoire", "Douche", "Balcon", "Vue mer", "Petit-déjeuner"];

  const fetchChambres = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getChambres();
      setChambres(data.content || []);
    } catch {
      toast.error("Erreur chargement chambres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChambres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChambre) {
        await adminApi.updateChambre(editingChambre.id, formData);
        toast.success("Chambre modifiée");
      } else {
        await adminApi.createChambre(formData);
        toast.success("Chambre créée");
      }
      setModalOpen(false);
      setEditingChambre(null);
      resetForm();
      fetchChambres();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const deleteChambre = async (id: string) => {
    if (!confirm("Supprimer cette chambre ?")) return;
    try {
      await adminApi.deleteChambre(id);
      toast.success("Chambre supprimée");
      fetchChambres();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const openEditModal = (chambre: any) => {
    setEditingChambre(chambre);
    setFormData({
      numero: chambre.numero,
      type: chambre.type,
      prixParNuit: chambre.prixParNuit,
      description: chambre.description || "",
      capacite: chambre.capacite,
      etage: chambre.etage,
      imageUrl: chambre.imageUrl || "",
      equipements: chambre.equipements || [],
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      type: "SIMPLE",
      prixParNuit: 0,
      description: "",
      capacite: 1,
      etage: 1,
      imageUrl: "",
      equipements: [],
    });
  };

  const addEquipement = () => {
    if (equipementInput && !formData.equipements.includes(equipementInput)) {
      setFormData({ ...formData, equipements: [...formData.equipements, equipementInput] });
      setEquipementInput("");
    }
  };

  const removeEquipement = (equip: string) => {
    setFormData({ ...formData, equipements: formData.equipements.filter(e => e !== equip) });
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      SIMPLE: "bg-blue-500/20 text-blue-400",
      DOUBLE: "bg-green-500/20 text-green-400",
      SUITE: "bg-purple-500/20 text-purple-400",
      PENTHOUSE: "bg-pink-500/20 text-pink-400",
      FAMILIALE: "bg-orange-500/20 text-orange-400",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl text-night-100">Gestion des chambres</h2>
          <p className="text-night-500 text-sm mt-1">Créer, modifier et supprimer les chambres</p>
        </div>
        <button
          onClick={() => {
            setEditingChambre(null);
            resetForm();
            setModalOpen(true);
          }}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus size={16} />
          Nouvelle chambre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chambres.map((chambre) => (
          <motion.div
            key={chambre.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-xl text-night-100">Chambre {chambre.numero}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${getTypeBadgeColor(chambre.type)}`}>
                  {chambre.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(chambre)}
                  className="w-8 h-8 rounded-lg border border-night-700 hover:border-gold-500 text-night-300 hover:text-gold-400 transition flex items-center justify-center"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteChambre(chambre.id)}
                  className="w-8 h-8 rounded-lg border border-night-700 hover:border-red-500 text-night-300 hover:text-red-400 transition flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gold-400 text-2xl font-semibold mt-2">{chambre.prixParNuit}€<span className="text-night-500 text-sm">/nuit</span></p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-night-300">Capacité: {chambre.capacite} personne{chambre.capacite > 1 ? 's' : ''}</p>
              <p className="text-night-300">Étage: {chambre.etage}</p>
              <p className={`text-sm ${chambre.disponible ? 'text-green-400' : 'text-red-400'}`}>
                {chambre.disponible ? '✓ Disponible' : '✗ Indisponible'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && chambres.length === 0 && (
        <div className="p-10 text-center text-night-500">Aucune chambre disponible</div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingChambre ? "Modifier la chambre" : "Créer une chambre"}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-night-300 text-sm mb-2">Numéro de chambre *</label>
              <input
                type="text"
                required
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
                placeholder="101"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              >
                <option value="SIMPLE">SIMPLE</option>
                <option value="DOUBLE">DOUBLE</option>
                <option value="SUITE">SUITE</option>
                <option value="PENTHOUSE">PENTHOUSE</option>
                <option value="FAMILIALE">FAMILIALE</option>
              </select>
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Prix par nuit (€) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.prixParNuit}
                onChange={(e) => setFormData({ ...formData, prixParNuit: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Capacité (personnes) *</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.capacite}
                onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">Étage *</label>
              <input
                type="number"
                required
                min="0"
                max="50"
                value={formData.etage}
                onChange={(e) => setFormData({ ...formData, etage: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-night-300 text-sm mb-2">URL Image</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-night-300 text-sm mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              placeholder="Description de la chambre..."
            />
          </div>
          <div>
            <label className="block text-night-300 text-sm mb-2">Équipements</label>
            <div className="flex gap-2 mb-3">
              <select
                value={equipementInput}
                onChange={(e) => setEquipementInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-night-900 border border-night-700 text-night-100 focus:border-gold-500 focus:outline-none transition"
              >
                <option value="">Sélectionner un équipement</option>
                {availableEquipments.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addEquipement}
                className="px-4 py-2 rounded-xl border border-gold-500 text-gold-400 hover:bg-gold-500/10 transition"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipements.map((equip) => (
                <span key={equip} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-night-800 text-night-300 text-sm">
                  {equip === "WiFi" && <Wifi size={12} />}
                  {equip === "TV" && <Tv size={12} />}
                  {equip === "Climatisation" && <Wind size={12} />}
                  {equip === "Mini-bar" && <Coffee size={12} />}
                  {equip === "Baignoire" && <Bath size={12} />}
                  {equip}
                  <button type="button" onClick={() => removeEquipement(equip)} className="hover:text-red-400 ml-1">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1 py-2">
              {editingChambre ? "Modifier" : "Créer"}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1 py-2">
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, index }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5" style={{ background: color }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-night-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display text-3xl font-semibold text-night-50">{value}</p>
      {sub && <p className="text-night-500 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "trajets" | "chambres" | "reservations" | "clients">("overview");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getStats();
      setStats(data);
    } catch {
      toast.error("Erreur chargement dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { icon: Users, label: "Total clients", value: stats.totalClients.toLocaleString("fr"), sub: "+12% ce mois", color: "#FBBF24" },
    { icon: Calendar, label: "Réservations", value: stats.totalReservations.toLocaleString("fr"), sub: `${stats.reservationsConfirmees} confirmées`, color: "#34D399" },
    { icon: TrendingUp, label: "Revenu total", value: `${(stats.revenuTotal / 1000).toFixed(0)}K€`, sub: "depuis le début", color: "#A78BFA" },
    { icon: Hotel, label: "Chambres libres", value: stats.chambresDisponibles, sub: "disponibles maintenant", color: "#60A5FA" },
  ] : [];

  const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const maxRevenu = stats ? Math.max(...stats.revenusMensuels.map((r) => r.revenu)) : 1;

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-gold-500 text-sm uppercase tracking-widest mb-1">Administration</p>
            <h1 className="font-display text-4xl font-light text-night-50">Dashboard <span className="gold-text font-semibold">Admin</span></h1>
          </div>
          <button onClick={fetchStats} className="btn-ghost py-2 px-4 text-sm gap-2 flex items-center">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            : statCards.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-night-100 flex items-center gap-2">
                <BarChart3 size={18} className="text-gold-500" />
                Revenus mensuels
              </h3>
            </div>
            {stats && (
              <div className="flex items-end gap-3 h-48">
                {stats.revenusMensuels.map((r, i) => (
                  <div key={r.mois} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(r.revenu / maxRevenu) * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-t-lg"
                      style={{ background: "linear-gradient(180deg, #FBBF24, #D97706)" }}
                    />
                    <span className="text-night-500 text-xs">{mois[r.mois - 1]}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
            <h3 className="font-display text-xl font-semibold text-night-100 mb-6">Statuts réservations</h3>
            {stats && (
              <div className="space-y-3">
                {stats.repartitionStatuts.map(({ statut, count }) => {
                  const total = stats.repartitionStatuts.reduce((a, s) => a + s.count, 0);
                  const pct = Math.round((count / total) * 100);
                  const colors: Record<string, string> = { CONFIRMEE: "#34D399", EN_ATTENTE: "#FBBF24", ANNULEE: "#F87171" };
                  return (
                    <div key={statut}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-night-300">{statut}</span>
                        <span className="text-night-400">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-night-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ background: colors[statut] || "#888" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div className="glass-card">
          <div className="flex border-b border-night-800/80 overflow-x-auto">
            {(["overview", "trajets", "chambres", "reservations", "clients"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative px-6 py-4 text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  activeTab === t ? "text-gold-400" : "text-night-400 hover:text-night-200"
                }`}
              >
                {t === "overview" ? "Aperçu" : t === "trajets" ? "Trajets" : t === "chambres" ? "Chambres" : t === "reservations" ? "Réservations" : "Clients"}
                {activeTab === t && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="text-night-500 text-sm text-center py-8">Tableau de bord général - Sélectionnez un onglet pour gérer</div>
            )}
            {activeTab === "trajets" && <TrajetsTable />}
            {activeTab === "chambres" && <ChambresTable />}
            {activeTab === "reservations" && (
              <div className="text-night-500 text-sm text-center py-8">Gestion des réservations à venir</div>
            )}
            {activeTab === "clients" && (
              <div className="text-night-500 text-sm text-center py-8">Gestion des clients à venir</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}