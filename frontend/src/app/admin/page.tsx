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
  Wind,
  Car,
  Bath,
  Check,
  ChevronRight,
  Bed,
  ArrowLeft,
  Shield,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Clock,
  UserCheck,
  UserX,
  Lock,
  QrCode,
  Camera
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import QRScanner from "@/components/admin/QRScanner";
import { adminApi, userApi } from "@/lib/api";
import type { AdminStats, Chambre, Trajet, } from "@/types";
import toast from "react-hot-toast";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// ─── Types ─────────────────────────────────────────────────────
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

interface UserFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  actif: boolean;
}

// ─── Color Configs ─────────────────────────────────────────────
const TRANSPORT_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  BUS: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600" },
  TRAIN: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600" },
  AVION: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", icon: "text-sky-600" },
  BATEAU: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-600" },
};

const ROOM_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  SIMPLE: { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-700" },
  DOUBLE: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  SUITE: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  PENTHOUSE: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  FAMILIALE: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
};

const STATUT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CONFIRMEE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  EN_ATTENTE: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  ANNULEE: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-purple-50", text: "text-purple-700" },
  CLIENT: { bg: "bg-blue-50", text: "text-blue-700" },
};

// ─── Modal ─────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-stone-200/80 shadow-2xl shadow-stone-900/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-stone-100 bg-white/95 backdrop-blur-sm z-10">
            <h2 className="font-serif text-xl text-stone-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-400 hover:text-stone-600 transition flex items-center justify-center active:scale-95"
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

function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [formData, setFormData] = useState<UserFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "CLIENT",
    actif: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
        toast.success("Utilisateur modifié");
      }
      setModalOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Supprimer définitivement cet utilisateur ? Cette action est irréversible.")) return;
    try {
      await adminApi.deleteUser(id);
      toast.success("Utilisateur supprimé");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur suppression");
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminApi.desactiverUser(id);
      toast.success(currentStatus ? "Utilisateur désactivé" : "Utilisateur activé");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const resetPassword = async (id: string, email: string) => {
    if (!confirm(`Réinitialiser le mot de passe de ${email} ? Le nouveau mot de passe sera "password123".`)) return;
    try {
      await adminApi.resetPassword(id);
      toast.success(`Mot de passe réinitialisé pour ${email}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || "",
      role: user.role,
      actif: user.actif,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      role: "CLIENT",
      actif: true,
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Gestion des utilisateurs</h2>
          <p className="text-stone-500 text-sm mt-1">Gérer les comptes clients et administrateurs</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
        >
          <option value="all">Tous les rôles</option>
          <option value="ADMIN">Administrateurs</option>
          <option value="CLIENT">Clients</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr className="text-left">
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Utilisateur</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Email</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Téléphone</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Rôle</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Statut</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleColors = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT;
                return (
                  <tr key={user.id} className="border-t border-stone-100 hover:bg-stone-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-700 font-medium text-sm">
                            {user.prenom?.[0]}{user.nom?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-stone-900 font-medium">{user.prenom} {user.nom}</p>
                          <p className="text-stone-400 text-xs">ID: {user.id?.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-stone-600 text-sm">{user.email}</td>
                    <td className="p-4 text-stone-600 text-sm">{user.telephone || "-"}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${roleColors.bg} ${roleColors.text}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        user.actif
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {user.actif ? <UserCheck size={12} /> : <UserX size={12} />}
                        {user.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="w-9 h-9 rounded-xl border border-stone-200 hover:border-amber-300 text-stone-500 hover:text-amber-600 transition flex items-center justify-center active:scale-95"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.actif)}
                          className={`w-9 h-9 rounded-xl border transition flex items-center justify-center active:scale-95 ${
                            user.actif
                              ? "border-amber-200 hover:border-amber-300 text-amber-600 hover:text-amber-700"
                              : "border-emerald-200 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700"
                          }`}
                          title={user.actif ? "Désactiver" : "Activer"}
                        >
                          {user.actif ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          onClick={() => resetPassword(user.id, user.email)}
                          className="w-9 h-9 rounded-xl border border-stone-200 hover:border-blue-300 text-stone-500 hover:text-blue-600 transition flex items-center justify-center active:scale-95"
                          title="Réinitialiser mot de passe"
                        >
                          <Lock size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="w-9 h-9 rounded-xl border border-stone-200 hover:border-red-300 text-stone-500 hover:text-red-600 transition flex items-center justify-center active:scale-95"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filteredUsers.length === 0 && (
          <div className="p-10 text-center text-stone-500 text-sm">
            {users.length === 0 ? "Aucun utilisateur" : "Aucun résultat pour cette recherche"}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Prénom *</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              >
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Statut</label>
              <select
                value={formData.actif ? "actif" : "inactif"}
                onChange={(e) => setFormData({ ...formData, actif: e.target.value === "actif" })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.98]"
            >
              {editingUser ? "Modifier" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-stone-50 text-stone-700 text-sm font-medium border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Trajets Table ─────────────────────────────────────────────
function TrajetsTable() {
  // ... (gardez votre code existant pour TrajetsTable)
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

  useEffect(() => { fetchTrajets(); }, []);

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
          <h2 className="font-serif text-2xl text-stone-900">Gestion des trajets</h2>
          <p className="text-stone-500 text-sm mt-1">Créer, modifier et supprimer les trajets</p>
        </div>
        <button
          onClick={() => { setEditingTrajet(null); resetForm(); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={16} /> Nouveau trajet
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr className="text-left">
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Départ</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Arrivée</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Transport</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Date départ</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Prix</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Places</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trajets.map((trajet) => {
                const colors = TRANSPORT_COLORS[trajet.typeTransport] || TRANSPORT_COLORS.BUS;
                return (
                  <tr key={trajet.id} className="border-t border-stone-100 hover:bg-stone-50/50 transition">
                    <td className="p-4 text-stone-900 font-medium">{trajet.lieuDepart}</td>
                    <td className="p-4 text-stone-700">{trajet.lieuArrivee}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                        <span className={colors.icon}>{getTransportIcon(trajet.typeTransport)}</span>
                        {trajet.typeTransport}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600 text-sm">{new Date(trajet.dateDepart).toLocaleString("fr-FR")}</td>
                    <td className="p-4 text-stone-900 font-semibold tabular-nums">{Number(trajet.prixParPlace).toFixed(2)}TND</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                        trajet.placesDisponibles > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {trajet.placesDisponibles}/{trajet.placesTotal}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(trajet)} className="w-9 h-9 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-700 transition flex items-center justify-center active:scale-95">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteTrajet(trajet.id)} className="w-9 h-9 rounded-xl border border-stone-200 hover:border-red-300 text-stone-500 hover:text-red-600 transition flex items-center justify-center active:scale-95">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && trajets.length === 0 && <div className="p-10 text-center text-stone-500 text-sm">Aucun trajet disponible</div>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTrajet ? "Modifier le trajet" : "Créer un trajet"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Lieu départ *</label><input type="text" required value={formData.lieuDepart} onChange={(e) => setFormData({ ...formData, lieuDepart: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Lieu arrivée *</label><input type="text" required value={formData.lieuArrivee} onChange={(e) => setFormData({ ...formData, lieuArrivee: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Date départ *</label><input type="datetime-local" required value={formData.dateDepart} onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Date arrivée *</label><input type="datetime-local" required value={formData.dateArrivee} onChange={(e) => setFormData({ ...formData, dateArrivee: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Type transport *</label><select required value={formData.typeTransport} onChange={(e) => setFormData({ ...formData, typeTransport: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"><option value="BUS">BUS</option><option value="TRAIN">TRAIN</option><option value="AVION">AVION</option><option value="BATEAU">BATEAU</option></select></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Prix par place (TND) *</label><input type="number" required min="0" step="0.01" value={formData.prixParPlace} onChange={(e) => setFormData({ ...formData, prixParPlace: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Places totales *</label><input type="number" required min="1" value={formData.placesTotal} onChange={(e) => setFormData({ ...formData, placesTotal: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Numéro véhicule</label><input type="text" value={formData.numeroVehicule} onChange={(e) => setFormData({ ...formData, numeroVehicule: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.98]">{editingTrajet ? "Modifier" : "Créer"}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-stone-50 text-stone-700 text-sm font-medium border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]">Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Chambres Table ────────────────────────────────────────────
function ChambresTable() {
  // ... (gardez votre code existant pour ChambresTable - je le raccourcis pour lisibilité)
  const [chambres, setChambres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChambre, setEditingChambre] = useState<any | null>(null);
  const [formData, setFormData] = useState<ChambreFormData>({
    numero: "", type: "SIMPLE", prixParNuit: 0, description: "", capacite: 1, etage: 1, imageUrl: "", equipements: [],
  });
  const [equipementInput, setEquipementInput] = useState("");
  const availableEquipments = ["WiFi", "TV", "Climatisation", "Mini-bar", "Coffre-fort", "Baignoire", "Douche", "Balcon", "Vue mer", "Petit-déjeuner"];

  const fetchChambres = async () => { try { setLoading(true); const { data } = await adminApi.getChambres(); setChambres(data.content || []); } catch { toast.error("Erreur chargement chambres"); } finally { setLoading(false); } };
  useEffect(() => { fetchChambres(); }, []);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { if (editingChambre) { await adminApi.updateChambre(editingChambre.id, formData); toast.success("Chambre modifiée"); } else { await adminApi.createChambre(formData); toast.success("Chambre créée"); } setModalOpen(false); setEditingChambre(null); resetForm(); fetchChambres(); } catch (error: any) { toast.error(error.response?.data?.message || "Erreur"); } };
  const deleteChambre = async (id: string) => { if (!confirm("Supprimer cette chambre ?")) return; try { await adminApi.deleteChambre(id); toast.success("Chambre supprimée"); fetchChambres(); } catch { toast.error("Erreur suppression"); } };
  const openEditModal = (chambre: any) => { setEditingChambre(chambre); setFormData({ numero: chambre.numero, type: chambre.type, prixParNuit: chambre.prixParNuit, description: chambre.description || "", capacite: chambre.capacite, etage: chambre.etage, imageUrl: chambre.imageUrl || "", equipements: chambre.equipements || [] }); setModalOpen(true); };
  const resetForm = () => { setFormData({ numero: "", type: "SIMPLE", prixParNuit: 0, description: "", capacite: 1, etage: 1, imageUrl: "", equipements: [] }); };
  const addEquipement = () => { if (equipementInput && !formData.equipements.includes(equipementInput)) { setFormData({ ...formData, equipements: [...formData.equipements, equipementInput] }); setEquipementInput(""); } };
  const removeEquipement = (equip: string) => { setFormData({ ...formData, equipements: formData.equipements.filter(e => e !== equip) }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div><h2 className="font-serif text-2xl text-stone-900">Gestion des chambres</h2><p className="text-stone-500 text-sm mt-1">Créer, modifier et supprimer les chambres</p></div>
        <button onClick={() => { setEditingChambre(null); resetForm(); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.98]"><Plus size={16} />Nouvelle chambre</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chambres.map((chambre) => {
          const colors = ROOM_TYPE_COLORS[chambre.type] || ROOM_TYPE_COLORS.SIMPLE;
          return (
            <motion.div key={chambre.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-stone-200/80 p-5 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-serif text-xl text-stone-900">Chambre {chambre.numero}</h3><span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border mt-1 ${colors.bg} ${colors.text} ${colors.border}`}>{chambre.type}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(chambre)} className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-700 transition flex items-center justify-center active:scale-95"><Pencil size={14} /></button>
                  <button onClick={() => deleteChambre(chambre.id)} className="w-8 h-8 rounded-lg border border-stone-200 hover:border-red-300 text-stone-500 hover:text-red-600 transition flex items-center justify-center active:scale-95"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="font-serif text-2xl font-semibold text-stone-900 mt-2">{Number(chambre.prixParNuit).toFixed(2)}TND<span className="text-stone-400 text-sm font-sans font-normal">/nuit</span></p>
              <div className="mt-3 space-y-1.5 text-sm"><p className="text-stone-600 flex items-center gap-1.5"><Users size={14} className="text-stone-400" />Capacité: {chambre.capacite} personne{chambre.capacite > 1 ? "s" : ""}</p><p className="text-stone-600">Étage: {chambre.etage}</p><p className={`text-sm font-medium flex items-center gap-1.5 ${chambre.disponible ? "text-emerald-600" : "text-red-600"}`}>{chambre.disponible ? (<><Check size={14} /> Disponible</>) : (<><X size={14} /> Indisponible</>)}</p></div>
            </motion.div>
          );
        })}
      </div>
      {!loading && chambres.length === 0 && <div className="p-10 text-center text-stone-500 text-sm">Aucune chambre disponible</div>}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingChambre ? "Modifier la chambre" : "Créer une chambre"}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Numéro de chambre *</label><input type="text" required value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Type *</label><select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"><option value="SIMPLE">SIMPLE</option><option value="DOUBLE">DOUBLE</option><option value="SUITE">SUITE</option><option value="PENTHOUSE">PENTHOUSE</option><option value="FAMILIALE">FAMILIALE</option></select></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Prix par nuit (TND) *</label><input type="number" required min="0" step="0.01" value={formData.prixParNuit} onChange={(e) => setFormData({ ...formData, prixParNuit: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Capacité (personnes) *</label><input type="number" required min="1" max="10" value={formData.capacite} onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Étage *</label><input type="number" required min="0" max="50" value={formData.etage} onChange={(e) => setFormData({ ...formData, etage: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">URL Image</label><input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" placeholder="https://..." /></div>
          </div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm" /></div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Équipements</label><div className="flex gap-2 mb-3"><select value={equipementInput} onChange={(e) => setEquipementInput(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"><option value="">Sélectionner un équipement</option>{availableEquipments.map(e => <option key={e} value={e}>{e}</option>)}</select><button type="button" onClick={addEquipement} className="px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition text-sm font-medium active:scale-95">Ajouter</button></div><div className="flex flex-wrap gap-2">{formData.equipements.map(equip => <span key={equip} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-sm">{equip === "WiFi" && <Wifi size={12} />}{equip === "TV" && <Tv size={12} />}{equip === "Climatisation" && <Wind size={12} />}{equip === "Mini-bar" && <Coffee size={12} />}{equip === "Baignoire" && <Bath size={12} />}{equip}<button type="button" onClick={() => removeEquipement(equip)} className="hover:text-red-500 ml-0.5 transition"><X size={12} /></button></span>)}</div></div>
          <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.98]">{editingChambre ? "Modifier" : "Créer"}</button><button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-stone-50 text-stone-700 text-sm font-medium border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]">Annuler</button></div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, index }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="bg-white rounded-2xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.03]" style={{ background: color }} />
      <div className="flex items-start justify-between mb-4"><div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-200`}><Icon size={20} className="text-stone-600" /></div></div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">{label}</p>
      <p className="font-serif text-3xl font-semibold text-stone-900">{value}</p>
      {sub && <p className="text-stone-500 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "trajets" | "chambres" | "reservations" | "clients" | "scanner">("overview");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && user?.role === "ADMIN") { fetchStats(); } }, [mounted, user]);

  if (mounted && (!user || user.role !== "ADMIN")) { notFound(); }
  if (!mounted) return null;

  const fetchStats = async () => { setLoading(true); try { const { data } = await adminApi.getStats(); setStats(data); } catch { toast.error("Erreur chargement dashboard"); } finally { setLoading(false); } };

  const statCards = stats ? [
    { icon: Users, label: "Total clients", value: stats.totalClients.toLocaleString("fr"), sub: "+12% ce mois", color: "#78716c" },
    { icon: Calendar, label: "Réservations", value: stats.totalReservations.toLocaleString("fr"), sub: `${stats.reservationsConfirmees} confirmées`, color: "#10b981" },
    { icon: TrendingUp, label: "Revenu total", value: `${(stats.revenuTotal / 1000).toFixed(0)}KTND`, sub: "depuis le début", color: "#f59e0b" },
    { icon: Hotel, label: "Chambres libres", value: stats.chambresDisponibles, sub: "disponibles maintenant", color: "#3b82f6" },
  ] : [];

  const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const maxRevenu = stats ? Math.max(...stats.revenusMensuels.map((r) => r.revenu)) : 1;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3 block">Administration</span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-stone-900 leading-tight">Dashboard <span className="italic text-amber-800">Admin</span></h1>
          </motion.div>
          <button onClick={fetchStats} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-stone-700 text-sm font-medium border border-stone-200 hover:bg-stone-50 transition-all active:scale-[0.98]"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-stone-200/80 h-36 animate-pulse" />) : statCards.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-6"><h3 className="font-serif text-xl text-stone-900 flex items-center gap-2"><BarChart3 size={18} className="text-amber-600" /> Revenus mensuels</h3></div>
            {stats && (<div className="flex items-end gap-3 h-48">{stats.revenusMensuels.map((r, i) => (<div key={r.mois} className="flex-1 flex flex-col items-center gap-2"><motion.div initial={{ height: 0 }} animate={{ height: `${(r.revenu / maxRevenu) * 100}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: "easeOut" }} className="w-full rounded-t-lg min-h-[4px]" style={{ background: "linear-gradient(180deg, #d97706, #b45309)" }} /><span className="text-stone-400 text-xs">{mois[r.mois - 1]}</span></div>))}</div>)}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
            <h3 className="font-serif text-xl text-stone-900 mb-6">Statuts réservations</h3>
            {stats && (<div className="space-y-4">{stats.repartitionStatuts.map(({ statut, count }) => { const total = stats.repartitionStatuts.reduce((a, s) => a + s.count, 0); const pct = Math.round((count / total) * 100); const colors = STATUT_COLORS[statut] || STATUT_COLORS.EN_ATTENTE; return (<div key={statut}><div className="flex justify-between text-sm mb-1.5"><span className="text-stone-700 font-medium">{statut}</span><span className="text-stone-500">{count} ({pct}%)</span></div><div className="h-2 bg-stone-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.6 }} className={`h-full rounded-full`} style={{ backgroundColor: statut === "CONFIRMEE" ? "#10b981" : statut === "EN_ATTENTE" ? "#f59e0b" : "#ef4444" }} /></div></div>); })}</div>)}
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300">
          <div className="flex border-b border-stone-100 overflow-x-auto">
            {(["overview", "trajets", "chambres", "clients", "reservations", "scanner"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`relative px-6 py-4 text-sm font-medium capitalize transition-all whitespace-nowrap ${activeTab === t ? "text-amber-700" : "text-stone-500 hover:text-stone-700"}`}>
                {t === "overview" ? "Aperçu" : t === "trajets" ? "Trajets" : t === "chambres" ? "Chambres" : t === "clients" ? "Utilisateurs" : t === "reservations" ? "Réservations" : "Scanner QR"}
                {activeTab === t && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "overview" && <div className="text-stone-500 text-sm text-center py-8">Tableau de bord général — Sélectionnez un onglet pour gérer</div>}
            {activeTab === "trajets" && <TrajetsTable />}
            {activeTab === "chambres" && <ChambresTable />}
            {activeTab === "clients" && <UsersTable />}
            {activeTab === "reservations" && <div className="text-stone-500 text-sm text-center py-8">Gestion des réservations à venir</div>}
            {activeTab === "scanner" && <QRScanner />}
          </div>
        </div>
      </div>
    </div>
  );
}