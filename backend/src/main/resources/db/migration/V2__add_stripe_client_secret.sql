-- Ajouter la colonne stripe_client_secret à la table reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS stripe_client_secret VARCHAR(255);

-- Mettre à jour les colonnes existantes
COMMENT ON COLUMN reservations.stripe_client_secret IS 'Stripe PaymentIntent client secret pour le frontend';