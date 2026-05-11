"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-night-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(ellipse, #D97706 0%, transparent 70%)" }} />
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}>
              <span className="text-night-950 font-display font-bold text-xl">L</span>
            </div>
            <span className="font-display text-2xl text-night-50">LuxeStay <span className="text-gold-500">&</span> Transit</span>
          </Link>
          <h1 className="font-display text-3xl font-light text-night-100 mb-2">
            Bon retour <span className="gold-text font-semibold">parmi nous</span>
          </h1>
          <p className="text-night-500 text-sm">Connectez-vous à votre compte</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-night-400 text-xs uppercase tracking-widest block mb-2">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vous@exemple.com"
                  className="input-gold pl-10"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-night-400 text-xs uppercase tracking-widest block mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500" />
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-gold pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-night-500 hover:text-night-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-night-400 text-sm cursor-pointer">
                <input type="checkbox" className="accent-gold-500" />
                Se souvenir de moi
              </label>
              <Link href="/auth/forgot-password" className="text-gold-600 hover:text-gold-400 text-sm transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-night-800 text-center">
            <p className="text-night-500 text-sm">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-gold-500 hover:text-gold-300 font-medium transition-colors">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
