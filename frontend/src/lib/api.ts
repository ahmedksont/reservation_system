import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || "Une erreur est survenue";

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 409) {
      toast.error("Conflit de réservation. Veuillez réessayer.");
      return Promise.reject(error);
    }

    if (error.response?.status >= 500) {
      toast.error("Erreur serveur. Veuillez réessayer plus tard.");
      return Promise.reject(error);
    }

    return Promise.reject({ ...error, message: msg });
  }
);

// ============================================
// CHAMBRES API
// ============================================
export const chambreApi = {
  getDisponibles: (params: Record<string, string | number>) =>
    api.get("/chambres/disponibles", { params }),
  getById: (id: string) => api.get(`/chambres/${id}`),
  getAll: (params?: Record<string, unknown>) => api.get("/chambres", { params }),
};

// ============================================
// TRAJETS API
// ============================================
export const trajetApi = {
  get: (params: Record<string, string | number>) => api.get("/trajets", { params }),
  getById: (id: string) => api.get(`/trajets/${id}`),
};

// ============================================
// RESERVATIONS API
// ============================================
export const reservationApi = {
  create: (data: unknown) => api.post("/reservations", data),
  getMes: (page = 0) => api.get("/reservations", { params: { page, size: 10 } }),
  getById: (id: string) => api.get(`/reservations/${id}`),
  cancel: (id: string) => api.delete(`/reservations/${id}`),
  getClientSecret: (id: string) => api.get(`/reservations/${id}/client-secret`),
  confirmPayment: (id: string) => api.post(`/reservations/${id}/confirm-payment`),
};

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (data: unknown) => api.post("/auth/login", data),
  register: (data: unknown) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
};

// ============================================
// USER API (pour le client connecté)
// ============================================
export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data: {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
  }) => api.put("/user/profile", data),
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.post("/user/change-password", data),
};

// ============================================
// ADMIN API
// ============================================
export const adminApi = {
  // Stats & Overview
  getStats: () => api.get("/admin/stats"),
  getClients: (page = 0) => api.get("/admin/clients", { params: { page, size: 20 } }),
  getReservations: (page = 0) => api.get("/admin/reservations", { params: { page, size: 20 } }),

  // Users Management (CRUD)
  getAllUsers: (page = 0, size = 20) =>
    api.get("/admin/users", { params: { page, size } }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (
    id: string,
    data: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      role?: string;
      actif?: boolean;
    }
  ) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  resetPassword: (id: string) => api.post(`/admin/users/${id}/reset-password`),
  desactiverUser: (id: string) => api.put(`/admin/clients/${id}/desactiver`),

  // Trajets CRUD
  getTrajets: (page = 0, size = 20) =>
    api.get("/admin/trajets", { params: { page, size } }),
  getTrajetById: (id: string) => api.get(`/admin/trajets/${id}`),
  createTrajet: (data: {
    lieuDepart: string;
    lieuArrivee: string;
    dateDepart: string;
    dateArrivee: string;
    typeTransport: string;
    prixParPlace: number;
    placesTotal: number;
    numeroVehicule?: string;
  }) => api.post("/admin/trajets", data),
  updateTrajet: (
    id: string,
    data: {
      lieuDepart?: string;
      lieuArrivee?: string;
      dateDepart?: string;
      dateArrivee?: string;
      typeTransport?: string;
      prixParPlace?: number;
      placesTotal?: number;
      placesDisponibles?: number;
      numeroVehicule?: string;
    }
  ) => api.put(`/admin/trajets/${id}`, data),
  deleteTrajet: (id: string) => api.delete(`/admin/trajets/${id}`),

  // Chambres CRUD
  getChambres: (page = 0, size = 20) =>
    api.get("/admin/chambres", { params: { page, size } }),
  getChambreById: (id: string) => api.get(`/admin/chambres/${id}`),
  createChambre: (data: {
    numero: string;
    type: string;
    prixParNuit: number;
    description?: string;
    capacite: number;
    disponible?: boolean;
    equipements?: string[];
    imageUrl?: string;
    etage: number;
  }) => api.post("/admin/chambres", data),
  updateChambre: (
    id: string,
    data: {
      numero?: string;
      type?: string;
      prixParNuit?: number;
      description?: string;
      capacite?: number;
      disponible?: boolean;
      equipements?: string[];
      imageUrl?: string;
      etage?: number;
    }
  ) => api.put(`/admin/chambres/${id}`, data),
  deleteChambre: (id: string) => api.delete(`/admin/chambres/${id}`),
};

export default api;