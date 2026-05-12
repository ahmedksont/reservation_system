export interface Chambre {
  id: string;
  numero: string;
  type: "SIMPLE" | "DOUBLE" | "SUITE" | "PENTHOUSE" | "FAMILIALE";
  prixParNuit: number;
  description?: string;
  capacite: number;
  disponible: boolean;
  equipements: string[];
  imageUrl?: string;      // Gardé pour compatibilité (première image)
  images?: string[];      // ✅ Nouveau : liste d'images pour carrousel
  etage: number;
  version?: number;
}

export interface Trajet {
  id: string;
  lieuDepart: string;
  lieuArrivee: string;
  dateDepart: string;
  dateArrivee: string;
  typeTransport: "TRAIN" | "BUS" | "AVION" | "BATEAU";
  prixParPlace: number;
  placesTotal: number;
  placesDisponibles: number;
  numeroVehicule?: string;
  dureeMinutes?: number;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: "CLIENT" | "ADMIN";
  actif?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LigneReservation {
  id: string;
  chambre?: Chambre;
  trajet?: Trajet;
  dateArrivee?: string;
  dateDepart?: string;
  nombrePlaces?: number;
  prixUnitaire: number;
  prixTotal: number;
}

export interface Reservation {
  id: string;
  client: Client;
  montantTotal: number;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE" | "TERMINEE";
  statutPaiement: "EN_ATTENTE" | "PAYE" | "REMBOURSE" | "ECHOUE";
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  lignes: LigneReservation[];
  notes?: string;
  createdAt: string;
  annuleeAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface AdminStats {
  totalClients: number;
  totalReservations: number;
  reservationsConfirmees: number;
  revenuTotal: number;
  chambresDisponibles: number;
  revenusMensuels: { mois: number; count: number; revenu: number }[];
  repartitionStatuts: { statut: string; count: number }[];
}

export interface ReservationRequest {
  chambreId?: string;
  trajetId?: string;
  dateArrivee?: string;
  dateDepart?: string;
  nombrePlaces?: number;
  notes?: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: "CLIENT" | "ADMIN";
  actif: boolean;
  createdAt: string;
  updatedAt?: string;
}