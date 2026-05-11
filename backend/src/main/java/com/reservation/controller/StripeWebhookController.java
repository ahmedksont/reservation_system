package com.reservation.controller;

import com.reservation.service.ReservationService;
import com.reservation.service.StripeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stripe/webhook")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final StripeService stripeService;
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        log.info("Webhook reçu");

        try {
            stripeService.verifierWebhook(payload, sigHeader);
            reservationService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook traité");
        } catch (Exception e) {
            log.error("Erreur webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Erreur");
        }
    }
}