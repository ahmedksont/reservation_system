"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Connexion réussie !");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Identifiants incorrects";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-amber-100/30 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sky-50/40 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
              <span className="text-white font-serif font-bold text-xl">L</span>
            </div>
            <span className="font-serif text-2xl text-stone-900">
              LuxeStay <span className="text-amber-600">&</span> Transit
            </span>
          </Link>
          <h1 className="font-serif text-3xl font-light text-stone-900 mb-2">
            Bon retour <span className="italic text-amber-800">parmi nous</span>
          </h1>
          <p className="text-stone-500 text-sm">Connectez-vous à votre compte</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 shadow-sm shadow-stone-900/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-stone-500 text-sm cursor-pointer">
                <input type="checkbox" className="accent-amber-600 w-4 h-4 rounded" />
                Se souvenir de moi
              </label>
              <Link href="/auth/forgot-password" className="text-amber-700 hover:text-amber-800 text-sm font-medium transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                isSubmitting
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20"
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-stone-500 text-sm">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-amber-700 hover:text-amber-800 font-medium transition-colors">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}