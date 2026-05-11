package com.reservation.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.reservation.exception.PaymentException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeService {

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            log.error("❌ Stripe secret key non configurée!");
            throw new IllegalStateException("Stripe secret key is required");
        }
        Stripe.apiKey = stripeSecretKey;
        log.info("✅ Stripe initialisé avec succès");
    }

    /**
     * Créer un PaymentIntent Stripe - retourne l'ID et le clientSecret
     */
    public Map<String, String> creerPaymentIntentWithSecret(BigDecimal montant, String devise, String reservationId, String email) {
        try {
            long montantCents = montant.multiply(BigDecimal.valueOf(100)).longValue();

            Map<String, String> metadata = new HashMap<>();
            metadata.put("reservation_id", reservationId);
            metadata.put("client_email", email);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(montantCents)
                    .setCurrency(devise.toLowerCase())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putAllMetadata(metadata)
                    .setDescription("Réservation #" + reservationId)
                    .setReceiptEmail(email)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("PaymentIntent créé: {} pour réservation: {}", paymentIntent.getId(), reservationId);

            Map<String, String> result = new HashMap<>();
            result.put("id", paymentIntent.getId());
            result.put("clientSecret", paymentIntent.getClientSecret());
            return result;

        } catch (StripeException e) {
            log.error("Erreur Stripe lors de la création du PaymentIntent", e);
            throw new PaymentException("Erreur de paiement: " + e.getMessage());
        }
    }

    /**
     * Récupérer le client_secret depuis Stripe
     */
    public String getClientSecret(String paymentIntentId) {
        try {
            PaymentIntent pi = PaymentIntent.retrieve(paymentIntentId);
            return pi.getClientSecret();
        } catch (StripeException e) {
            log.error("Erreur récupération client secret", e);
            throw new PaymentException("Impossible de récupérer le client secret");
        }
    }

    /**
     * Vérifier le statut d'un PaymentIntent
     */
    public String verifierStatutPaymentIntent(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return paymentIntent.getStatus();
        } catch (StripeException e) {
            log.error("Erreur vérification statut PaymentIntent", e);
            throw new PaymentException("Impossible de vérifier le statut du paiement");
        }
    }

    /**
     * Remboursement complet
     */
    public void rembourser(String paymentIntentId) {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .build();

            Refund.create(params);
            log.info("Remboursement effectué pour PaymentIntent: {}", paymentIntentId);

        } catch (StripeException e) {
            log.error("Erreur remboursement Stripe", e);
            throw new PaymentException("Erreur remboursement: " + e.getMessage());
        }
    }

    /**
     * Vérifier la signature du webhook Stripe
     */
    public Event verifierWebhook(String payload, String sigHeader) {
        try {
            return com.stripe.net.Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            throw new PaymentException("Webhook invalide: " + e.getMessage());
        }
    }
}