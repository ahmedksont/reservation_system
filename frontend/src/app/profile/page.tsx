"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  CreditCard, 
  Settings, 
  Camera,
  ChevronRight,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  X
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import { userApi, authApi } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter, notFound } from "next/navigation";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  if (!user) {
    notFound();
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Profile form
  const [profileForm, setProfileForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        prenom: user.prenom || "",
        nom: user.nom || "",
        email: user.email || "",
        telephone: user.telephone || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userApi.updateProfile({
        nom: profileForm.nom,
        prenom: profileForm.prenom,
        email: profileForm.email,
        telephone: profileForm.telephone,
      });
      
      // Update local store
      updateUser(data);
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      
      toast.success("Mot de passe modifié avec succès");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }
    
    setLoading(true);
    try {
      await authApi.deleteAccount();
      toast.success("Compte supprimé avec succès");
      logout();
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du compte");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Informations", icon: UserIcon },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Paiement", icon: CreditCard },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-800">
      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid lg:grid-cols-[280px_1fr] gap-12"
        >
          {/* Sidebar */}
          <aside className="space-y-8">
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm">
              <div className="relative group mb-6">
                <div className="w-24 h-24 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center overflow-hidden">
                  {user ? (
                    <span className="text-3xl font-serif font-medium text-amber-800 uppercase">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </span>
                  ) : (
                    <UserIcon size={40} className="text-amber-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-stone-900 text-white rounded-full border-4 border-white group-hover:scale-110 transition-transform shadow-lg">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-serif font-semibold text-stone-900">
                  {user ? `${user.prenom} ${user.nom}` : "Utilisateur"}
                </h2>
                <p className="text-stone-400 text-sm mt-1">{user?.email || "email@exemple.com"}</p>
                <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-full inline-block">
                  {user?.role === "ADMIN" ? "Administrateur" : "Membre"}
                </div>
              </div>
            </motion.div>

            <motion.nav variants={itemVariants} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      activeTab === tab.id 
                        ? "bg-stone-900 text-white shadow-lg shadow-stone-900/10" 
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={18} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </div>
                    <ChevronRight size={14} className={activeTab === tab.id ? "opacity-100" : "opacity-0"} />
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-stone-50 px-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium text-sm"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </motion.nav>
          </aside>

          {/* Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-light text-stone-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-stone-500 mt-2">
                  Gérez vos informations et préférences personnelles.
                </p>
              </div>
              {activeTab === "profile" && (
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition-all shadow-lg shadow-amber-800/10 disabled:opacity-50"
                >
                  <Save size={16} />
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 md:p-12">
                {activeTab === "profile" && (
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Prénom</label>
                        <input 
                          type="text" 
                          value={profileForm.prenom}
                          onChange={(e) => setProfileForm({ ...profileForm, prenom: e.target.value })}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Nom</label>
                        <input 
                          type="text" 
                          value={profileForm.nom}
                          onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Adresse Email</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-5 text-stone-400" size={18} />
                        <input 
                          type="email" 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Téléphone</label>
                        <div className="relative flex items-center">
                          <Phone className="absolute left-5 text-stone-400" size={18} />
                          <input 
                            type="tel" 
                            value={profileForm.telephone}
                            onChange={(e) => setProfileForm({ ...profileForm, telephone: e.target.value })}
                            placeholder="+33 6 00 00 00 00"
                            className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Localisation</label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-5 text-stone-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="Paris, France"
                            className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-800">
                          <Settings size={20} />
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-stone-900">Préférences de compte</h4>
                          <p className="text-sm text-stone-500 mt-1">
                            Votre compte est actuellement configuré en Français. Vous recevrez nos communications dans cette langue.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="md:hidden">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-800 text-white rounded-2xl font-semibold hover:bg-amber-900 transition-all shadow-lg disabled:opacity-50"
                      >
                        <Save size={18} />
                        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <h3 className="font-serif text-xl font-semibold text-stone-900">Changer le mot de passe</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Mot de passe actuel</label>
                          <div className="relative">
                            <input 
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="w-full px-5 py-4 pr-12 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Nouveau mot de passe</label>
                            <div className="relative">
                              <input 
                                type={showNewPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-5 py-4 pr-12 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                              >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Confirmer le mot de passe</label>
                            <div className="relative">
                              <input 
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full px-5 py-4 pr-12 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition-all shadow-lg disabled:opacity-50"
                      >
                        {loading ? "Changement en cours..." : "Changer le mot de passe"}
                      </button>
                    </form>

                    <hr className="border-stone-100" />

                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-stone-900">Double authentification (2FA)</h3>
                          <p className="text-sm text-stone-500 mt-1">Sécurisez votre compte avec une vérification en deux étapes</p>
                        </div>
                        <button className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all">
                          Activer
                        </button>
                      </div>
                    </div>

                    <hr className="border-stone-100" />

                    <div className="space-y-6">
                      <h3 className="font-serif text-xl font-semibold text-stone-900 text-red-600">Zone dangereuse</h3>
                      <div className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border border-red-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-red-200 flex items-center justify-center text-red-500">
                            <Trash2 size={24} />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">Supprimer mon compte</p>
                            <p className="text-sm text-stone-500">Cette action est irréversible. Toutes vos données seront effacées.</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-8">
                    <p className="text-stone-500 italic">Configurez comment vous souhaitez être informé de vos réservations et des offres exclusives.</p>
                    <div className="space-y-4">
                      {[
                        { title: "Emails de réservation", desc: "Confirmation et rappels de vos séjours.", enabled: true },
                        { title: "Offres promotionnelles", desc: "Recevez des réductions exclusives par email.", enabled: false },
                        { title: "Alertes de sécurité", desc: "Notifications sur les connexions suspectes.", enabled: true },
                        { title: "Newsletter mensuelle", desc: "L'actualité des plus beaux établissements.", enabled: false }
                      ].map((notif, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-stone-50 last:border-0">
                          <div>
                            <p className="font-medium text-stone-900">{notif.title}</p>
                            <p className="text-sm text-stone-500">{notif.desc}</p>
                          </div>
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer ${notif.enabled ? "bg-amber-600" : "bg-stone-300"}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${notif.enabled ? "translate-x-6" : "translate-x-1"}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div className="space-y-8">
                    <div className="p-8 border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-300">
                        <CreditCard size={32} />
                      </div>
                      <div>
                        <p className="font-serif text-xl font-semibold text-stone-900">Aucune carte enregistrée</p>
                        <p className="text-stone-500 mt-1 max-w-xs">Ajoutez un mode de paiement pour des réservations plus rapides.</p>
                      </div>
                      <button className="mt-4 px-8 py-3 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all">
                        Ajouter une carte
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}