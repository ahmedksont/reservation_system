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
  Camera,
  LayoutDashboard,
  LogOut,
  Settings,
  Bell,
  Menu
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import QRScanner from "@/components/admin/QRScanner";
import CalendarView from "@/components/admin/CalendarView";
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


// ─── Reservations Table ────────────────────────────────────────────
// ─── Reservations Table avec QR Code ────────────────────────────
function ReservationsTable() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [formData, setFormData] = useState({
    statut: "",
    statutPaiement: "",
    notes: "",
  });

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getReservations();
      setReservations(data.content || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Erreur chargement réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateReservation(editingReservation.id, {
        statut: formData.statut,
        statutPaiement: formData.statutPaiement,
        notes: formData.notes,
      });
      toast.success("Réservation modifiée");
      setModalOpen(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Supprimer définitivement cette réservation ? Cette action est irréversible.")) return;
    try {
      await adminApi.deleteReservation(id);
      toast.success("Réservation supprimée");
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur suppression");
    }
  };

  const openEditModal = (reservation: any) => {
    setEditingReservation(reservation);
    setFormData({
      statut: reservation.statut,
      statutPaiement: reservation.statutPaiement,
      notes: reservation.notes || "",
    });
    setModalOpen(true);
  };

  const openQrModal = (reservation: any) => {
    setSelectedReservation(reservation);
    setQrModalOpen(true);
  };

  const getStatusColor = (statut: string) => {
    const colors = STATUT_COLORS[statut] || STATUT_COLORS.EN_ATTENTE;
    return colors;
  };

  const getPaymentColor = (statut: string) => {
    switch (statut) {
      case "PAYE": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
      case "EN_ATTENTE": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
      case "REMBOURSE": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
      case "ECHOUE": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
      default: return { bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200" };
    }
  };

  const generateQRCodeUrl = (reservationId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `${window.location.origin}/reservations/${reservationId}`
    )}`;
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = r.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.statut === filterStatus;
    const matchesPayment = filterPayment === "all" || r.statutPaiement === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Gestion des réservations</h2>
          <p className="text-stone-500 text-sm mt-1">Gérer toutes les réservations clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par client, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="CONFIRMEE">Confirmée</option>
          <option value="ANNULEE">Annulée</option>
          <option value="TERMINEE">Terminée</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
        >
          <option value="all">Tous les paiements</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYE">Payé</option>
          <option value="REMBOURSE">Remboursé</option>
          <option value="ECHOUE">Échoué</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr className="text-left">
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">ID</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Client</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Type</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Détails</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Montant</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Statut</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Paiement</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Date</th>
                <th className="p-4 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => {
                const statusColors = getStatusColor(res.statut);
                const paymentColors = getPaymentColor(res.statutPaiement);
                const type = res.lignes?.[0]?.chambre ? "CHAMBRE" : res.lignes?.[0]?.trajet ? "TRAJET" : "-";
                const details = res.lignes?.[0]?.chambre 
                  ? `Chambre ${res.lignes[0].chambre.numero}`
                  : res.lignes?.[0]?.trajet 
                    ? `${res.lignes[0].trajet.lieuDepart} → ${res.lignes[0].trajet.lieuArrivee}`
                    : "-";
                
                return (
                  <tr key={res.id} className="border-t border-stone-100 hover:bg-stone-50/50 transition">
                    <td className="p-4 font-mono text-xs text-stone-600">
                      {res.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-stone-900 font-medium">{res.client?.prenom} {res.client?.nom}</p>
                        <p className="text-stone-400 text-xs">{res.client?.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        type === "CHAMBRE" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}>
                        {type === "CHAMBRE" ? <Hotel size={12} /> : <Plane size={12} />}
                        {type}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600 text-sm">{details}</td>
                    <td className="p-4 font-semibold text-stone-900 tabular-nums">
                      {res.montantTotal} TND
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {res.statut === "EN_ATTENTE" ? "En attente" : 
                         res.statut === "CONFIRMEE" ? "Confirmée" :
                         res.statut === "ANNULEE" ? "Annulée" : "Terminée"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border}`}>
                        {res.statutPaiement === "EN_ATTENTE" ? "En attente" :
                         res.statutPaiement === "PAYE" ? "Payé" :
                         res.statutPaiement === "REMBOURSE" ? "Remboursé" : "Échoué"}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500 text-xs">
                      {new Date(res.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openQrModal(res)}
                          className="w-9 h-9 rounded-xl border border-stone-200 hover:border-amber-300 text-stone-500 hover:text-amber-600 transition flex items-center justify-center active:scale-95"
                          title="QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(res)}
                          className="w-9 h-9 rounded-xl border border-stone-200 hover:border-amber-300 text-stone-500 hover:text-amber-600 transition flex items-center justify-center active:scale-95"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteReservation(res.id)}
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
        {!loading && filteredReservations.length === 0 && (
          <div className="p-10 text-center text-stone-500 text-sm">
            Aucune réservation trouvée
          </div>
        )}
      </div>

      {/* Edit Reservation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modifier la réservation">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
            >
              <option value="EN_ATTENTE">En attente</option>
              <option value="CONFIRMEE">Confirmée</option>
              <option value="ANNULEE">Annulée</option>
              <option value="TERMINEE">Terminée</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Statut paiement</label>
            <select
              value={formData.statutPaiement}
              onChange={(e) => setFormData({ ...formData, statutPaiement: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
            >
              <option value="EN_ATTENTE">En attente</option>
              <option value="PAYE">Payé</option>
              <option value="REMBOURSE">Remboursé</option>
              <option value="ECHOUE">Échoué</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
              placeholder="Notes internes..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.98]"
            >
              Enregistrer
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

      {/* QR Code Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="QR Code de réservation">
        {selectedReservation && (
          <div className="text-center space-y-6">
            <div className="bg-white p-6 rounded-2xl inline-block mx-auto">
              <img
                src={generateQRCodeUrl(selectedReservation.id)}
                alt={`QR Code réservation ${selectedReservation.id?.slice(0, 8)}`}
                className="w-64 h-64 mx-auto"
              />
            </div>
            <div>
              <p className="text-stone-500 text-sm mb-2">Scannez ce code pour accéder à la réservation</p>
              <p className="font-mono text-sm text-stone-800 bg-stone-50 p-3 rounded-xl break-all">
                {`${window.location.origin}/reservations/${selectedReservation.id}`}
              </p>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                <p className="text-amber-800 text-sm font-medium">
                  Réservation #{selectedReservation.id?.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  Client: {selectedReservation.client?.prenom} {selectedReservation.client?.nom}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/reservations/${selectedReservation.id}`);
                toast.success("Lien copié dans le presse-papier");
              }}
              className="px-6 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition"
            >
              Copier le lien
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
} 

// ─── Trajets Table ─────────────────────────────────────────────
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
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Équipements</label>
            <div className="flex gap-2 mb-3">
              <select value={equipementInput} onChange={(e) => setEquipementInput(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm">
                <option value="">Sélectionner un équipement</option>
                {availableEquipments.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <button type="button" onClick={addEquipement} className="px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition text-sm font-medium active:scale-95">Ajouter</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipements.map(equip => (
                <span key={equip} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-sm">
                  {equip === "WiFi" && <Wifi size={12} />}
                  {equip === "TV" && <Tv size={12} />}
                  {equip === "Climatisation" && <Wind size={12} />}
                  {equip === "Mini-bar" && <Coffee size={12} />}
                  {equip === "Baignoire" && <Bath size={12} />}
                  {equip}
                  <button type="button" onClick={() => removeEquipement(equip)} className="hover:text-red-500 ml-0.5 transition"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.98]">{editingChambre ? "Modifier" : "Créer"}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-stone-50 text-stone-700 text-sm font-medium border border-stone-200 hover:bg-stone-100 transition-all active:scale-[0.98]">Annuler</button>
          </div>
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
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="bg-white rounded-3xl border border-stone-200/80 p-6 hover:shadow-lg hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.03]" style={{ background: color }} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-200`}>
          <Icon size={20} className="text-stone-600" />
        </div>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">{label}</p>
      <p className="font-serif text-3xl font-semibold text-stone-900">{value}</p>
      {sub && <p className="text-stone-500 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "trajets" | "chambres" | "reservations" | "clients" | "scanner" | "calendar">("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: "overview", label: "Aperçu", icon: LayoutDashboard },
    { id: "calendar", label: "Calendrier", icon: Calendar },
    { id: "reservations", label: "Réservations", icon: Bell },
    { id: "scanner", label: "Scanner QR", icon: QrCode },
    { id: "chambres", label: "Chambres", icon: Hotel },
    { id: "trajets", label: "Trajets", icon: Bus },
    { id: "clients", label: "Utilisateurs", icon: Users },
  ];

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
    <div className="min-h-screen bg-[#FDFDFC] text-stone-800 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200/60 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="p-8">
            <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              LUXURY<span className="text-amber-700/60 italic font-light">Admin</span>
            </h2>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id 
                    ? "bg-stone-900 text-white shadow-xl shadow-stone-900/10" 
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? "text-amber-400" : ""} />
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-stone-100">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-[#FDFDFC]">
        {/* Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-stone-500">
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-serif font-medium text-stone-900 capitalize">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-stone-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-stone-900 leading-none mb-1">{user?.nom}</p>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Administrateur</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 font-bold">
                  {user?.nom?.[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-stone-200/60 h-40 animate-pulse" />
                  ))
                ) : (
                  statCards.map((s, i) => <StatCard key={s.label} {...s} index={i} />)
                )}
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-3 gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 }} 
                  className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/60 p-8 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-serif text-xl text-stone-900">Analyse des Revenus</h3>
                      <p className="text-stone-400 text-xs mt-1">Performance des 6 derniers mois</p>
                    </div>
                    <select className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-600">
                      <option>Derniers 6 mois</option>
                      <option>Cette année</option>
                    </select>
                  </div>
                  {stats && (
                    <div className="flex items-end gap-4 h-64 px-4">
                      {stats.revenusMensuels.map((r, i) => (
                        <div key={r.mois} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="relative w-full flex flex-col items-center justify-end h-full">
                            <motion.div 
                              initial={{ height: 0 }} 
                              animate={{ height: `${(r.revenu / maxRevenu) * 100}%` }} 
                              transition={{ delay: 0.4 + i * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }} 
                              className="w-full max-w-[40px] rounded-t-2xl min-h-[8px] bg-stone-900 group-hover:bg-amber-700 transition-colors duration-500"
                            />
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap">
                              {r.revenu.toLocaleString()} TND
                            </div>
                          </div>
                          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{mois[r.mois - 1]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.35 }} 
                  className="bg-white rounded-3xl border border-stone-200/60 p-8 shadow-sm"
                >
                  <h3 className="font-serif text-xl text-stone-900 mb-8">Flux de Réservation</h3>
                  {stats && (
                    <div className="space-y-6">
                      {stats.repartitionStatuts.map(({ statut, count }) => { 
                        const total = stats.repartitionStatuts.reduce((a, s) => a + s.count, 0); 
                        const pct = Math.round((count / total) * 100); 
                        const isConfirmed = statut === "CONFIRMEE";
                        const isPending = statut === "EN_ATTENTE";
                        
                        return (
                          <div key={statut} className="group">
                            <div className="flex justify-between text-sm mb-2.5">
                              <span className="text-stone-600 font-medium flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConfirmed ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-red-500"}`} />
                                {statut}
                              </span>
                              <span className="text-stone-900 font-bold">{count} <span className="text-stone-400 font-normal text-xs ml-1">({pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-stone-50 rounded-full overflow-hidden border border-stone-100">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${pct}%` }} 
                                transition={{ delay: 0.5, duration: 0.8 }} 
                                className={`h-full rounded-full`} 
                                style={{ backgroundColor: isConfirmed ? "#10b981" : isPending ? "#f59e0b" : "#ef4444" }} 
                              />
                            </div>
                          </div>
                        ); 
                      })}
                      
                      <div className="mt-12 p-6 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-amber-600 shadow-sm">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <p className="text-stone-900 font-bold text-sm">+18.5% croissance</p>
                            <p className="text-stone-400 text-[10px] uppercase tracking-widest font-medium">Comparé au mois dernier</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "calendar" && <CalendarView />}
                {activeTab === "trajets" && <TrajetsTable />}
                {activeTab === "chambres" && <ChambresTable />}
                {activeTab === "clients" && <UsersTable />}
                {activeTab === "reservations" && <ReservationsTable />}
                {activeTab === "scanner" && <QRScanner />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}