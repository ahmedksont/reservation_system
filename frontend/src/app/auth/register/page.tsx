"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const schema = z.object({
  nom:        z.string().min(2, "Minimum 2 caractères"),
  prenom:     z.string().min(2, "Minimum 2 caractères"),
  email:      z.string().email("Email invalide"),
  telephone:  z.string().optional(),
  motDePasse: z.string().min(6, "Minimum 6 caractères"),
  confirm:    z.string(),
}).refine(d => d.motDePasse === d.confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router  = useRouter();
  const { register: registerUser } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({ nom: data.nom, prenom: data.prenom, email: data.email, motDePasse: data.motDePasse, telephone: data.telephone });
      toast.success("Compte créé avec succès !");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      toast.error(msg);
    }
  };

  const fields = [
    { name: "prenom" as const, label: "Prénom",         icon: User,  type: "text",     placeholder: "Jean" },
    { name: "nom"    as const, label: "Nom",            icon: User,  type: "text",     placeholder: "Dupont" },
    { name: "email"  as const, label: "Email",          icon: Mail,  type: "email",    placeholder: "jean@exemple.com" },
    { name: "telephone" as const, label: "Téléphone",   icon: Phone, type: "tel",      placeholder: "+33 6 00 00 00 00" },
  ];

  return (
    <div className="min-h-screen bg-night-950 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-6"
          style={{ background: "radial-gradient(ellipse, #D97706 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}>
              <span className="text-night-950 font-display font-bold text-xl">L</span>
            </div>
            <span className="font-display text-2xl text-night-50">LuxeStay <span className="text-gold-500">&</span> Transit</span>
          </Link>
          <h1 className="font-display text-3xl font-light text-night-100 mb-2">
            Rejoignez l&apos;<span className="gold-text font-semibold">élite</span>
          </h1>
          <p className="text-night-500 text-sm">Créez votre compte premium gratuitement</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.slice(0, 2).map(f => (
                <div key={f.name}>
                  <label className="text-night-400 text-xs uppercase tracking-widest block mb-2">{f.label}</label>
                  <div className="relative">
                    <f.icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500" />
                    <input {...register(f.name)} type={f.type} placeholder={f.placeholder} className="input-gold pl-9 text-sm" />
                  </div>
                  {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>}
                </div>
              ))}
            </div>

            {fields.slice(2).map(f => (
              <div key={f.name}>
                <label className="text-night-400 text-xs uppercase tracking-widest block mb-2">{f.label}</label>
                <div className="relative">
                  <f.icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500" />
                  <input {...register(f.name)} type={f.type} placeholder={f.placeholder} className="input-gold pl-9" />
                </div>
                {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}

            <div>
              <label className="text-night-400 text-xs uppercase tracking-widest block mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500" />
                <input {...register("motDePasse")} type={showPwd ? "text" : "password"} placeholder="••••••••" className="input-gold pl-9 pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-night-500 hover:text-night-300">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.motDePasse && <p className="text-red-400 text-xs mt-1">{errors.motDePasse.message}</p>}
            </div>

            <div>
              <label className="text-night-400 text-xs uppercase tracking-widest block mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500" />
                <input {...register("confirm")} type="password" placeholder="••••••••" className="input-gold pl-9" />
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold w-full justify-center py-3.5 mt-2 disabled:opacity-50"
            >
              {isSubmitting
                ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <><span>Créer mon compte</span> <ArrowRight size={16} /></>
              }
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-night-800 text-center">
            <p className="text-night-500 text-sm">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-gold-500 hover:text-gold-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
