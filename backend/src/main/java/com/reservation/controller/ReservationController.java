package com.reservation.controller;

import com.reservation.dto.request.ReservationRequest;
import com.reservation.dto.response.ReservationResponse;
import com.reservation.service.ReservationService;
import com.reservation.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final StripeService stripeService;

    /**
     * POST /api/reservations
     * Créer une nouvelle réservation
     */
    @PostMapping
    public ResponseEntity<ReservationResponse> creerReservation(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal String clientId) {

        ReservationResponse response = reservationService.creerReservation(clientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/reservations
     * Historique des réservations du client connecté
     */
    @GetMapping
    public ResponseEntity<Page<ReservationResponse>> getMesReservations(
            @AuthenticationPrincipal String clientId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(reservationService.getReservationsClient(clientId, pageable));
    }

    /**
     * GET /api/reservations/{id}
     * Détails d'une réservation
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservation(
            @PathVariable String id,
            @AuthenticationPrincipal String clientId) {

        return ResponseEntity.ok(reservationService.getReservationById(id, clientId));
    }

    /**
     * DELETE /api/reservations/{id}
     * Annuler une réservation + remboursement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ReservationResponse> annulerReservation(
            @PathVariable String id,
            @AuthenticationPrincipal String clientId) {

        return ResponseEntity.ok(reservationService.annulerReservation(id, clientId));
    }

    /**
     * GET /api/reservations/{id}/client-secret
     * Récupérer le client_secret Stripe pour le paiement frontend
     */
    @GetMapping("/{id}/client-secret")
    public ResponseEntity<Map<String, String>> getClientSecret(
            @PathVariable String id,
            @AuthenticationPrincipal String clientId) {

        String clientSecret = reservationService.getClientSecret(id, clientId);
        return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
    }

    /**
     * POST /api/reservations/webhook/stripe
     * Webhook Stripe pour confirmer le paiement automatiquement
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<Void> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        reservationService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/reservations/{id}/confirm-payment
     * Confirmer manuellement le paiement après succès Stripe (alternative au webhook)
     */
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<ReservationResponse> confirmPayment(
            @PathVariable String id,
            @AuthenticationPrincipal String clientId) {

        ReservationResponse response = reservationService.confirmPayment(id, clientId);
        return ResponseEntity.ok(response);
    }
}