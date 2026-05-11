-- V1__init_schema.sql
-- Schéma initial pour le système de réservation

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table clients
CREATE TABLE clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'CLIENT')),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_email ON clients(email);

-- Table chambres
CREATE TABLE chambres (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    numero VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('SIMPLE', 'DOUBLE', 'SUITE', 'PENTHOUSE', 'FAMILIALE')),
    prix_par_nuit DECIMAL(10,2) NOT NULL,
    description VARCHAR(500),
    capacite INTEGER NOT NULL DEFAULT 1,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500),
    etage INTEGER NOT NULL DEFAULT 1,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_chambre_type ON chambres(type);
CREATE INDEX idx_chambre_prix ON chambres(prix_par_nuit);

-- Table equipements des chambres
CREATE TABLE chambre_equipements (
    chambre_id VARCHAR(36) REFERENCES chambres(id) ON DELETE CASCADE,
    equipement VARCHAR(100) NOT NULL
);

-- Table trajets
CREATE TABLE trajets (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lieu_depart VARCHAR(100) NOT NULL,
    lieu_arrivee VARCHAR(100) NOT NULL,
    date_depart TIMESTAMP NOT NULL,
    date_arrivee TIMESTAMP NOT NULL,
    type_transport VARCHAR(20) NOT NULL CHECK (type_transport IN ('TRAIN', 'BUS', 'AVION', 'BATEAU')),
    prix_par_place DECIMAL(10,2) NOT NULL,
    places_total INTEGER NOT NULL,
    places_disponibles INTEGER NOT NULL DEFAULT 0,
    numero_vehicule VARCHAR(50),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_trajet_depart ON trajets(lieu_depart);
CREATE INDEX idx_trajet_arrivee ON trajets(lieu_arrivee);
CREATE INDEX idx_trajet_date ON trajets(date_depart);

-- Table reservations
CREATE TABLE reservations (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    client_id VARCHAR(36) NOT NULL REFERENCES clients(id),
    montant_total DECIMAL(10,2) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
        CHECK (statut IN ('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE')),
    statut_paiement VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
        CHECK (statut_paiement IN ('EN_ATTENTE', 'PAYE', 'REMBOURSE', 'ECHOUE')),
    stripe_payment_intent_id VARCHAR(100),
    stripe_session_id VARCHAR(100),
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    annulee_at TIMESTAMP
);

CREATE INDEX idx_reservation_client ON reservations(client_id);
CREATE INDEX idx_reservation_statut ON reservations(statut);
CREATE INDEX idx_reservation_date ON reservations(created_at);

-- Table lignes_reservation
CREATE TABLE lignes_reservation (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reservation_id VARCHAR(36) NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    chambre_id VARCHAR(36) REFERENCES chambres(id),
    trajet_id VARCHAR(36) REFERENCES trajets(id),
    date_arrivee DATE,
    date_depart DATE,
    nombre_places INTEGER,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    prix_total DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_chambre_or_trajet CHECK (
        (chambre_id IS NOT NULL AND trajet_id IS NULL) OR
        (chambre_id IS NULL AND trajet_id IS NOT NULL)
    )
);

-- Données de démonstration
INSERT INTO clients (nom, prenom, email, mot_de_passe, role) VALUES
    ('Admin', 'System', 'admin@luxestay.com', '$2a$12$placeholder', 'ADMIN');

INSERT INTO chambres (numero, type, prix_par_nuit, description, capacite, disponible, etage) VALUES
    ('101', 'SIMPLE',    89,  'Chambre cosy avec vue sur jardin',         1, true, 1),
    ('102', 'FAMILIALE', 199, 'Chambre familiale communicante',            5, true, 1),
    ('201', 'DOUBLE',    149, 'Chambre double élégante, lit king size',    2, true, 2),
    ('205', 'DOUBLE',    159, 'Double supérieure avec balcon',             2, true, 2),
    ('301', 'SUITE',     299, 'Suite luxueuse, salon séparé et jacuzzi',  3, true, 3),
    ('302', 'SUITE',     349, 'Suite junior avec vue mer',                 2, true, 3),
    ('401', 'PENTHOUSE', 599, 'Penthouse panoramique, terrasse privée',    4, true, 4);

INSERT INTO chambre_equipements (chambre_id, equipement)
SELECT id, 'wifi' FROM chambres
UNION ALL
SELECT id, 'climatisation' FROM chambres WHERE type IN ('SUITE', 'PENTHOUSE', 'DOUBLE')
UNION ALL
SELECT id, 'bain' FROM chambres WHERE type IN ('SUITE', 'PENTHOUSE')
UNION ALL
SELECT id, 'café' FROM chambres WHERE type IN ('SUITE', 'PENTHOUSE', 'DOUBLE');

INSERT INTO trajets (lieu_depart, lieu_arrivee, date_depart, date_arrivee, type_transport, prix_par_place, places_total, places_disponibles) VALUES
    ('Paris Gare de Lyon', 'Lyon Part-Dieu', '2025-07-01 08:00', '2025-07-01 10:00', 'TRAIN', 45,  200, 145),
    ('Paris CDG',          'Rome FCO',       '2025-07-05 10:30', '2025-07-05 12:45', 'AVION', 189, 180, 67),
    ('Marseille',          'Nice',           '2025-07-03 09:00', '2025-07-03 11:30', 'BUS',   25,  50,  32),
    ('Bordeaux',           'Paris Montparnasse','2025-07-10 14:00','2025-07-10 16:05','TRAIN',69, 350, 210);
