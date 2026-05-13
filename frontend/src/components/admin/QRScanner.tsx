"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Calendar, 
  MapPin, 
  Hotel, 
  Bus, 
  Loader2,
  RefreshCw,
  Upload
} from "lucide-react";
import { reservationApi, adminApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    // When isScanning becomes true, start the camera after a short delay to ensure DOM is ready
    if (isScanning && !scannerRef.current) {
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("QR Code Scanned:", decodedText);
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // ignore scan errors
        }
      );
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsScanning(false);
    }
  };

  const startScanning = () => {
    setCameraError(null);
    setScanResult(null);
    setReservation(null);
    setIsScanning(true);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    } else {
      setIsScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setScanResult(decodedText);
    await stopScanning();
    fetchReservation(decodedText);
  };

  const fetchReservation = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await adminApi.getReservationById(id);
      setReservation(data);
      toast.success("Réservation trouvée (Admin)");
    } catch (error: any) {
      console.error("Error fetching reservation:", error);
      toast.error("Réservation introuvable ou accès refusé");
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setCameraError(null);
    
    try {
      // For file scanning, we can create a temporary instance
      const html5QrCode = new Html5Qrcode("reader-hidden");
      const result = await html5QrCode.scanFile(file, true);
      console.log("QR Code Scanned from File:", result);
      handleScanSuccess(result);
    } catch (err) {
      console.error("File scan error:", err);
      toast.error("Aucun QR code trouvé dans l'image");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScanResult(null);
    setReservation(null);
    setCameraError(null);
    setIsScanning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="font-serif text-2xl text-stone-900">Validation QR Code</h2>
        <p className="text-stone-500 text-sm mt-1">Scannez le pass d'un client pour valider sa réservation</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="space-y-6">
          {/* Hidden element for file scanning */}
          <div id="reader-hidden" className="hidden" />
          
          <div className="relative aspect-square bg-stone-100 rounded-3xl overflow-hidden border-2 border-dashed border-stone-200 flex flex-col items-center justify-center group transition-all hover:border-amber-300">
            {isScanning && <div id="reader" className="absolute inset-0 w-full h-full z-10 bg-black" />}
            
            {!isScanning && !scanResult && (
              <div className="text-center p-8 z-0">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <QrCode size={32} className="text-amber-600" />
                </div>
                <p className="text-stone-900 font-medium mb-2">Prêt pour le scan</p>
                <p className="text-stone-400 text-xs mb-6">Utilisez la caméra ou téléchargez une photo</p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={startScanning}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-all active:scale-[0.98]"
                  >
                    <Camera size={18} />
                    Activer la caméra
                  </button>
                  
                  <label className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 transition-all active:scale-[0.98] cursor-pointer">
                    <Upload size={18} />
                    Choisir une photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            )}

            {isScanning && (
              <button
                onClick={stopScanning}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-900 shadow-lg"
              >
                <X size={20} />
              </button>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-red-50 z-30 text-center">
                <AlertCircle size={40} className="text-red-500 mb-4" />
                <p className="text-red-800 font-medium">{cameraError}</p>
                <button
                  onClick={startScanning}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-stone-400"
              >
                <Loader2 size={40} className="animate-spin mb-4 text-amber-600" />
                <p>Recherche de la réservation...</p>
              </motion.div>
            ) : reservation ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm h-full"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      reservation.statutPaiement === 'PAYE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {reservation.statutPaiement === 'PAYE' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {reservation.statutPaiement === 'PAYE' ? 'Paiement Validé' : 'Paiement en attente'}
                    </span>
                    <h3 className="font-serif text-2xl text-stone-900">
                      Réservation #{reservation.id.slice(0, 8).toUpperCase()}
                    </h3>
                  </div>
                  <button 
                    onClick={reset}
                    className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Client</p>
                      <p className="text-stone-900 font-bold">{reservation.client.prenom} {reservation.client.nom}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Montant</p>
                      <p className="text-stone-900 font-bold text-lg">{reservation.montantTotal.toFixed(2)} TND</p>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Statut</p>
                      <p className="text-stone-900 font-bold">{reservation.statut}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Contenu du pass</p>
                    {reservation.lignes.map((ligne: any) => (
                      <div key={ligne.id} className="flex items-center gap-3 text-sm text-stone-600">
                        {ligne.chambre ? (
                          <><Hotel size={16} className="text-amber-600" /> Chambre {ligne.chambre.numero}</>
                        ) : (
                          <><Bus size={16} className="text-amber-600" /> {ligne.trajet.lieuDepart} → {ligne.trajet.lieuArrivee}</>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-stone-900/10 active:scale-[0.98]"
                  onClick={() => toast.success("Pass validé avec succès")}
                >
                  Confirmer la présence
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-stone-400 text-center p-8 bg-white rounded-3xl border border-stone-200 border-dashed"
              >
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                  <QrCode size={32} className="opacity-20" />
                </div>
                <p className="max-w-[200px]">Scannez un code pour voir les détails de la réservation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
