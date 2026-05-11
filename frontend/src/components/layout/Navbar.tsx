"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel, Train, Calendar, User, LogOut, Menu, X, ChevronDown, Shield } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "/rooms",     label: "Hôtels",     icon: Hotel },
    { href: "/transport", label: "Transports",  icon: Train },
    { href: "/reservations", label: "Mes réservations", icon: Calendar, auth: true },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-white/90 border-b border-stone-200/60 shadow-sm shadow-stone-900/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-500/20">
              <span className="text-white font-serif font-bold text-lg">L</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-serif text-xl font-semibold text-stone-900">LuxeStay</span>
              <span className="text-amber-600 font-serif text-xl"> & Transit</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, auth }) => {
              if (auth && !user) return null;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all text-sm font-medium"
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <span className="text-amber-700 text-xs font-semibold">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </span>
                  </div>
                  <span className="font-medium">{user.prenom}</span>
                  <ChevronDown size={14} className="text-stone-400" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/10 py-2 overflow-hidden"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-sm transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={15} />
                        Mon profil
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-amber-700 hover:bg-amber-50 text-sm transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield size={15} />
                          Dashboard admin
                        </Link>
                      )}
                      <hr className="border-stone-100 my-1" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 text-sm transition-colors w-full"
                      >
                        <LogOut size={15} />
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all text-sm font-medium border border-transparent hover:border-stone-200"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm font-medium hover:shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-stone-500 hover:text-stone-900 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-100 bg-white/95 backdrop-blur-xl px-4 py-4 shadow-lg shadow-stone-900/5"
          >
            {navLinks.map(({ href, label, icon: Icon, auth }) => {
              if (auth && !user) return null;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 py-3 text-stone-600 hover:text-stone-900 text-base font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-4 border-t border-stone-100 mt-2">
              {user ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all text-sm font-medium"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all text-sm font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}