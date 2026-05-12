"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
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
  Save
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to let hydration complete
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
                  Membre Gold
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
              <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition-all shadow-lg shadow-amber-800/10">
                <Save size={16} />
                Enregistrer les modifications
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 md:p-12">
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Prénom</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={user?.prenom}
                            className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Nom</label>
                        <input 
                          type="text" 
                          defaultValue={user?.nom}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Adresse Email</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-5 text-stone-400" size={18} />
                        <input 
                          type="email" 
                          defaultValue={user?.email}
                          className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
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
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="font-serif text-xl font-semibold text-stone-900">Changer le mot de passe</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Mot de passe actuel</label>
                          <input type="password" underline className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-amber-500 transition-all" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Nouveau mot de passe</label>
                            <input type="password" underline className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-amber-500 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 px-1">Confirmer le mot de passe</label>
                            <input type="password" underline className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-amber-500 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-stone-100" />

                    <div className="space-y-6">
                      <h3 className="font-serif text-xl font-semibold text-stone-900">Double authentification (2FA)</h3>
                      <div className="flex items-center justify-between p-6 bg-stone-50 rounded-3xl border border-stone-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400">
                            <Shield size={24} />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">Sécurisez votre compte</p>
                            <p className="text-sm text-stone-500">Ajoutez une couche de sécurité supplémentaire.</p>
                          </div>
                        </div>
                        <button className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all">
                          Activer
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
                        { title: "Emails de réservation", desc: "Confirmation et rappels de vos séjours." },
                        { title: "Offres promotionnelles", desc: "Recevez des réductions exclusives par email." },
                        { title: "Alertes de sécurité", desc: "Notifications sur les connexions suspectes." },
                        { title: "Newsletter mensuelle", desc: "L'actualité des plus beaux établissements." }
                      ].map((notif, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-stone-50 last:border-0">
                          <div>
                            <p className="font-medium text-stone-900">{notif.title}</p>
                            <p className="text-sm text-stone-500">{notif.desc}</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
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

            <motion.div variants={itemVariants} className="md:hidden">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-5 bg-amber-800 text-white rounded-2xl font-semibold hover:bg-amber-900 transition-all shadow-lg">
                <Save size={18} />
                Enregistrer les modifications
              </button>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
