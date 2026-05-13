# 🏨 LuxeStay & Transit — Système de Réservation Premium

Plateforme complète de réservation d'hôtels et de transports, développée avec **Spring Boot**, **Next.js**, **Supabase** et **Stripe**.

---

## 🏗️ Architecture

```
reservation-system/
├── backend/          ← Spring Boot 3.2 + JPA/Hibernate
│   ├── src/main/java/com/reservation/
│   │   ├── entity/           ← Entités JPA (Client, Chambre, Trajet, Réservation, LigneRéservation)
│   │   ├── repository/       ← Repositories Spring Data + JPQL avancé
│   │   ├── service/          ← Logique métier (Réservation, Stripe, Email)
│   │   ├── controller/       ← REST API Controllers
│   │   ├── security/         ← JWT Auth Filter + JwtService
│   │   ├── dto/              ← Request / Response DTOs
│   │   ├── config/           ← SecurityConfig, CorsConfig
│   │   └── exception/        ← GlobalExceptionHandler + exceptions métier
│   └── src/main/resources/
│       ├── application.yml   ← Configuration (Supabase, JWT, Stripe, Mail)
│       └── db/migration/     ← Flyway SQL migrations
│
└── frontend/         ← Next.js 14 + TypeScript + Tailwind CSS
    └── src/
        ├── app/              ← Pages (/, /rooms, /transport, /auth, /admin, /payment, /reservations)
        ├── components/       ← UI Components réutilisables
        ├── store/            ← Zustand state management
        ├── lib/              ← Axios API client
        └── types/            ← TypeScript types
```

---

## ⚙️ Installation

### Prérequis
- Java 21+
- Node.js 20+
- Compte Supabase
- Compte Stripe

### 1. Base de données — Supabase
1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez les identifiants de connexion PostgreSQL dans **Settings → Database**
3. Flyway applique automatiquement les migrations au démarrage

### 2. Backend — Spring Boot

```bash
cd backend

# Copiez et renseignez les variables d'environnement
cp .env.example .env

# Variables à renseigner dans .env :
# SUPABASE_HOST=db.VOTRE_ID.supabase.co
# SUPABASE_PASSWORD=...
# JWT_SECRET=...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# MAIL_USERNAME=...
# MAIL_PASSWORD=...

# Lancer l'application
./mvnw spring-boot:run
# API disponible sur http://localhost:8080/api
```

### 3. Frontend — Next.js

```bash
cd frontend

# Copiez et renseignez les variables
cp .env.example .env.local

# Variables :
# NEXT_PUBLIC_API_URL=http://localhost:8080/api
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
# Frontend disponible sur http://localhost:3000
```

---

## 🔌 API REST

| Méthode | Endpoint                         | Auth    | Description                          |
|---------|----------------------------------|---------|--------------------------------------|
| POST    | `/auth/register`                 | Public  | Inscription                          |
| POST    | `/auth/login`                    | Public  | Connexion → JWT                      |
| GET     | `/auth/me`                       | JWT     | Profil utilisateur                   |
| GET     | `/chambres/disponibles`          | Public  | Recherche chambres avec filtres      |
| GET     | `/chambres/{id}`                 | Public  | Détail chambre                       |
| POST    | `/chambres`                      | ADMIN   | Créer une chambre                    |
| GET     | `/trajets`                       | Public  | Recherche trajets                    |
| GET     | `/trajets/{id}`                  | Public  | Détail trajet                        |
| POST    | `/reservations`                  | JWT     | Créer une réservation                |
| GET     | `/reservations`                  | JWT     | Mes réservations (paginé)            |
| GET     | `/reservations/{id}`             | JWT     | Détail réservation                   |
| DELETE  | `/reservations/{id}`             | JWT     | Annuler + remboursement Stripe       |
| GET     | `/reservations/{id}/client-secret` | JWT   | Client secret Stripe pour paiement  |
| POST    | `/reservations/webhook/stripe`   | Public  | Webhook Stripe (confirmation paiement)|
| GET     | `/admin/stats`                   | ADMIN   | Statistiques dashboard               |
| GET     | `/admin/clients`                 | ADMIN   | Liste des clients                    |

---

## 🛡️ Gestion de la concurrence ORM

### Optimistic Locking
Les entités `Chambre` et `Trajet` possèdent un champ `@Version` :
```java
@Version
private Long version;
```
Si deux transactions modifient simultanément la même entité, Hibernate lève une `ObjectOptimisticLockingFailureException` → convertie en `409 Conflict`.

### Pessimistic Locking
Lors d'une réservation, la chambre/trajet est verrouillé en écriture :
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<Chambre> findByIdWithLock(String id);
```
Timeout configuré à 3 secondes.

### Isolation de transaction
Le service de réservation utilise `Isolation.SERIALIZABLE` pour garantir la cohérence.

---

## 💳 Intégration Stripe

1. **PaymentIntent** créé côté backend à la création de la réservation
2. **client_secret** transmis au frontend via `/reservations/{id}/client-secret`
3. **Stripe Elements** (React) utilisé pour le formulaire de paiement
4. **Webhook** Stripe confirme le paiement et met à jour le statut en base

---

## 🎨 Frontend — Design System

- **Palette** : Noir profond `#0F0D0B` + Or `#FBBF24`
- **Typographie** : Cormorant Garamond (titres) + Inter (corps)
- **Animations** : Framer Motion (fadeUp, stagger, count-up, shimmer)
- **Glass morphism** : backdrop-blur + border dorée semi-transparente
- **Composants** : Navbar sticky, SearchBar tabbed, RoomCard, PaymentForm Stripe, AdminDashboard

---

## 🔒 Sécurité

- **JWT** (JJWT 0.12) avec secret configurable, expiration 24h
- **BCrypt** (rounds 12) pour les mots de passe
- **CORS** configuré pour le frontend uniquement
- **@PreAuthorize** sur les routes admin
- **Validation** Bean Validation sur tous les DTOs
- **GlobalExceptionHandler** → réponses d'erreur uniformes

---

## 📦 Technologies

| Layer       | Stack                                           |
|-------------|------------------------------------------------|
| Backend     | Spring Boot 3.2, JPA/Hibernate, Flyway, BCrypt |
| Base données| Supabase (PostgreSQL)                          |
| Paiement    | Stripe (PaymentIntent + Webhooks)              |
| Auth        | JWT (JJWT)                                     |
| Mail        | Spring Mail (SMTP)                             |
| Frontend    | Next.js 14, TypeScript, Tailwind CSS           |
| UI/Anim     | Framer Motion, Lucide React                    |
| State       | Zustand                                        |
| Forms       | React Hook Form + Zod                          |
| HTTP        | Axios                                          |
