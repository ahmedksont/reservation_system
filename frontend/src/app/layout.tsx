import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/components/providers/AuthProvider";
import Preloader from "@/components/ui/Preloader";
import dynamic from "next/dynamic";
// Chargement dynamique du ChatBot pour éviter les erreurs SSR
const ChatBot = dynamic(() => import("../components/chat/ChatBot"), {
  ssr: false,
  loading: () => null,
});


export const metadata: Metadata = {
  title: "LuxeStay & Transit — Réservation Premium",
  description: "Plateforme de réservation d'hôtels et transports haut de gamme",
  keywords: "réservation, hôtel, transport, luxe, voyage",
  openGraph: {
    title: "LuxeStay & Transit",
    description: "Réservation premium hôtel & transport",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <Preloader />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1E1B18",
                color: "#F8F7F4",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#FBBF24", secondary: "#0F0D0B" },
              },
              error: {
                iconTheme: { primary: "#F87171", secondary: "#0F0D0B" },
              },
            }}
          />
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}