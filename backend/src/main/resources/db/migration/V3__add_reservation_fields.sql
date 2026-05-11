-- Ajouter les colonnes manquantes à la table reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS notes VARCHAR(500);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS annulee_at TIMESTAMP;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS stripe_client_secret VARCHAR(255);

-- Ajouter un index sur annulee_at
CREATE INDEX IF NOT EXISTS idx_reservations_annulee_at ON reservations(annulee_at);