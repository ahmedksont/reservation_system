package com.reservation.service;

import com.reservation.dto.request.ReservationRequest;
import com.reservation.dto.response.ReservationResponse;
import com.reservation.entity.*;
import com.reservation.exception.*;
import com.reservation.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChambreRepository chambreRepository;
    private final TrajetRepository trajetRepository;
    private final ClientRepository clientRepository;
    private final StripeService stripeService;
    private final EmailService emailService;

    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)
    public ReservationResponse creerReservation(String clientId, ReservationRequest request) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));

        Reservation reservation = Reservation.builder()
                .client(client)
                .statutPaiement(Reservation.StatutPaiement.EN_ATTENTE)
                .statut(Reservation.StatutReservation.EN_ATTENTE)
                .notes(request.getNotes())
                .build();

        BigDecimal montantTotal = BigDecimal.ZERO;

        if (request.getChambreId() != null) {
            montantTotal = montantTotal.add(reserverChambre(reservation, request));
        }

        if (request.getTrajetId() != null) {
            montantTotal = montantTotal.add(reserverTrajet(reservation, request));
        }

        reservation.setMontantTotal(montantTotal);
        reservation = reservationRepository.save(reservation);

        // Créer le PaymentIntent
        Map<String, String> stripeData = stripeService.creerPaymentIntentWithSecret(
                montantTotal, "EUR", reservation.getId(), client.getEmail()
        );

        reservation.setStripePaymentIntentId(stripeData.get("id"));
        reservation.setStripeClientSecret(stripeData.get("clientSecret"));
        reservation = reservationRepository.save(reservation);

        emailService.envoyerConfirmationReservation(client.getEmail(), reservation);

        return ReservationResponse.from(reservation);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(String reservationId, String clientId) {
        Reservation reservation = reservationRepository.findByIdWithDetails(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        if (!reservation.getClient().getId().equals(clientId)) {
            throw new AccessDeniedException("Accès refusé");
        }

        return ReservationResponse.from(reservation);
    }

    @Transactional(readOnly = true)
    public String getClientSecret(String reservationId, String clientId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        if (!reservation.getClient().getId().equals(clientId)) {
            throw new AccessDeniedException("Accès refusé");
        }

        if (reservation.getStripeClientSecret() == null) {
            throw new PaymentException("Aucun clientSecret trouvé pour cette réservation");
        }

        return reservation.getStripeClientSecret();
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getReservationsClient(String clientId, Pageable pageable) {
        return reservationRepository.findByClientId(clientId, pageable)
                .map(ReservationResponse::from);
    }

    @Transactional
    public ReservationResponse annulerReservation(String reservationId, String clientId) {

        Reservation reservation = reservationRepository.findByIdWithDetails(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        if (!reservation.getClient().getId().equals(clientId)) {
            throw new AccessDeniedException("Accès refusé");
        }

        if (reservation.getStatut() == Reservation.StatutReservation.ANNULEE) {
            throw new BusinessException("Déjà annulée");
        }

        // Remboursement Stripe si déjà payé
        if (reservation.getStripePaymentIntentId() != null &&
                reservation.getStatutPaiement() == Reservation.StatutPaiement.PAYE) {
            stripeService.rembourser(reservation.getStripePaymentIntentId());
        }

        reservation.setStatut(Reservation.StatutReservation.ANNULEE);
        reservation.setStatutPaiement(Reservation.StatutPaiement.REMBOURSE);
        reservation.setAnnuleeAt(LocalDateTime.now());
        reservation = reservationRepository.save(reservation);

        return ReservationResponse.from(reservation);
    }

    /**
     * ✅ NOUVELLE MÉTHODE: Confirmer le paiement après succès Stripe
     */
    @Transactional
    public ReservationResponse confirmPayment(String reservationId, String clientId) {
        Reservation reservation = reservationRepository.findByIdWithDetails(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        if (!reservation.getClient().getId().equals(clientId)) {
            throw new AccessDeniedException("Accès refusé");
        }

        if (reservation.getStatutPaiement() == Reservation.StatutPaiement.PAYE) {
            log.info("Réservation déjà payée: {}", reservationId);
            return ReservationResponse.from(reservation);
        }

        // Vérifier le statut du PaymentIntent auprès de Stripe
        String paymentIntentStatus = stripeService.verifierStatutPaymentIntent(reservation.getStripePaymentIntentId());

        if ("succeeded".equals(paymentIntentStatus)) {
            reservation.setStatutPaiement(Reservation.StatutPaiement.PAYE);
            reservation.setStatut(Reservation.StatutReservation.CONFIRMEE);
            reservation = reservationRepository.save(reservation);
            log.info("✅ Paiement confirmé pour la réservation: {}", reservationId);

            // Envoyer email de confirmation de paiement
            emailService.envoyerConfirmationPaiement(reservation.getClient().getEmail(), reservation);
        } else {
            log.warn("Paiement non confirmé pour la réservation: {}, statut Stripe: {}", reservationId, paymentIntentStatus);
            throw new PaymentException("Le paiement n'a pas été confirmé. Statut: " + paymentIntentStatus);
        }

        return ReservationResponse.from(reservation);
    }

    public void handleStripeWebhook(String payload, String sigHeader) {
        stripeService.verifierWebhook(payload, sigHeader);
    }

    // ========================
    // PRIVATE METHODS
    // ========================

    private BigDecimal reserverChambre(Reservation reservation, ReservationRequest request) {
        Chambre chambre = chambreRepository.findByIdWithLock(request.getChambreId())
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));

        long nuits = ChronoUnit.DAYS.between(request.getDateArrivee(), request.getDateDepart());
        BigDecimal prixTotal = chambre.getPrixParNuit().multiply(BigDecimal.valueOf(nuits));

        LigneReservation ligne = LigneReservation.builder()
                .reservation(reservation)
                .chambre(chambre)
                .dateArrivee(request.getDateArrivee())
                .dateDepart(request.getDateDepart())
                .prixUnitaire(chambre.getPrixParNuit())
                .prixTotal(prixTotal)
                .build();

        reservation.getLignes().add(ligne);
        return prixTotal;
    }

    private BigDecimal reserverTrajet(Reservation reservation, ReservationRequest request) {
        Trajet trajet = trajetRepository.findByIdWithLock(request.getTrajetId())
                .orElseThrow(() -> new ResourceNotFoundException("Trajet non trouvé"));

        int nbPlaces = request.getNombrePlaces() != null ? request.getNombrePlaces() : 1;

        if (trajet.getPlacesDisponibles() < nbPlaces) {
            throw new DisponibiliteException("Pas assez de places disponibles");
        }

        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() - nbPlaces);
        trajetRepository.save(trajet);

        BigDecimal prixTotal = trajet.getPrixParPlace().multiply(BigDecimal.valueOf(nbPlaces));

        LigneReservation ligne = LigneReservation.builder()
                .reservation(reservation)
                .trajet(trajet)
                .nombrePlaces(nbPlaces)
                .prixUnitaire(trajet.getPrixParPlace())
                .prixTotal(prixTotal)
                .build();

        reservation.getLignes().add(ligne);
        return prixTotal;
    }
}