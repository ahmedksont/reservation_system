"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 mb-6 block">
            Erreur 404
          </span>
          <h1 className="font-serif text-8xl md:text-9xl font-light text-stone-900 mb-6 tracking-tight">
            404
          </h1>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-6">
            Page introuvable
          </h2>
          <p className="text-stone-500 text-lg mb-10 max-w-lg mx-auto">
            Désolé, la page que vous recherchez n'existe pas, a été supprimée ou vous n'avez pas les autorisations nécessaires pour y accéder.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all hover:shadow-xl hover:shadow-stone-900/20 active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <Home size={18} />
              Retour à l'accueil
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-stone-900 font-medium border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <ArrowLeft size={18} />
              Page précédente
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
