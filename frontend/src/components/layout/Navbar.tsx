"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel, Train, Calendar, User, LogOut, Menu, X, ChevronDown } from "lucide-react";
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
          ? "backdrop-blur-xl bg-night-950/90 border-b border-gold-900/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}
            >
              <span className="text-night-950 font-display font-bold text-lg">L</span>
            </div>
            <div>
              <span className="font-display text-xl font-semibold text-night-50">LuxeStay</span>
              <span className="text-gold-500 font-display text-xl"> & Transit</span>
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-night-300 hover:text-night-50 hover:bg-night-800/50 transition-all text-sm font-medium"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-800/30 text-night-200 hover:border-gold-600/50 transition-all text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <span className="text-gold-400 text-xs font-semibold">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </span>
                  </div>
                  {user.prenom}
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-52 glass-card py-2 shadow-card-hover"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-night-200 hover:text-night-50 hover:bg-night-800/50 text-sm transition-colors"
                      >
                        <User size={15} />
                        Mon profil
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-gold-400 hover:bg-night-800/50 text-sm transition-colors"
                        >
                          Dashboard admin
                        </Link>
                      )}
                      <hr className="border-gold-900/30 my-1" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 text-night-400 hover:text-red-400 hover:bg-night-800/50 text-sm transition-colors w-full"
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
                <Link href="/auth/login" className="btn-ghost py-2 px-5 text-sm">
                  Connexion
                </Link>
                <Link href="/auth/register" className="btn-gold py-2 px-5 text-sm">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-night-300 hover:text-night-50"
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
            className="md:hidden border-t border-gold-900/20 bg-night-950/95 backdrop-blur-xl px-4 py-4"
          >
            {navLinks.map(({ href, label, icon: Icon, auth }) => {
              if (auth && !user) return null;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 py-3 text-night-300 hover:text-night-50 text-base"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-4 border-t border-gold-900/20 mt-2">
              {user ? (
                <button onClick={logout} className="btn-ghost w-full justify-center py-3">
                  <LogOut size={16} /> Déconnexion
                </button>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost w-full justify-center py-3" onClick={() => setMenuOpen(false)}>Connexion</Link>
                  <Link href="/auth/register" className="btn-gold w-full justify-center py-3" onClick={() => setMenuOpen(false)}>S&apos;inscrire</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
