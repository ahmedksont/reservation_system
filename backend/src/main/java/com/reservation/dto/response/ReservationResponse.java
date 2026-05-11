package com.reservation.dto.response;

import com.reservation.entity.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder
public class ReservationResponse {

    private String id;
    private ClientInfo client;
    private BigDecimal montantTotal;
    private String statut;
    private String statutPaiement;
    private String stripePaymentIntentId;
    private String stripeClientSecret;  // ✅ AJOUTER CE CHAMP
    private String notes;
    private List<LigneInfo> lignes;
    private LocalDateTime createdAt;
    private LocalDateTime annuleeAt;

    public static ReservationResponse from(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .client(ClientInfo.from(r.getClient()))
                .montantTotal(r.getMontantTotal())
                .statut(r.getStatut() != null ? r.getStatut().name() : null)
                .statutPaiement(r.getStatutPaiement() != null ? r.getStatutPaiement().name() : null)
                .stripePaymentIntentId(r.getStripePaymentIntentId())
                .stripeClientSecret(r.getStripeClientSecret())  // ✅ AJOUTER
                .notes(r.getNotes())
                .lignes(r.getLignes() != null ? r.getLignes().stream().map(LigneInfo::from).collect(Collectors.toList()) : null)
                .createdAt(r.getCreatedAt())
                .annuleeAt(r.getAnnuleeAt())
                .build();
    }

    @Data @Builder
    public static class ClientInfo {
        private String id;
        private String nom;
        private String prenom;
        private String email;
        private String telephone;

        public static ClientInfo from(Client c) {
            if (c == null) return null;
            return ClientInfo.builder()
                    .id(c.getId())
                    .nom(c.getNom())
                    .prenom(c.getPrenom())
                    .email(c.getEmail())
                    .telephone(c.getTelephone())
                    .build();
        }
    }

    @Data @Builder
    public static class LigneInfo {
        private String id;
        private ChambreInfo chambre;
        private TrajetInfo trajet;
        private LocalDate dateArrivee;
        private LocalDate dateDepart;
        private Integer nombrePlaces;
        private BigDecimal prixUnitaire;
        private BigDecimal prixTotal;

        public static LigneInfo from(LigneReservation l) {
            if (l == null) return null;
            return LigneInfo.builder()
                    .id(l.getId())
                    .chambre(l.getChambre() != null ? ChambreInfo.from(l.getChambre()) : null)
                    .trajet(l.getTrajet() != null ? TrajetInfo.from(l.getTrajet()) : null)
                    .dateArrivee(l.getDateArrivee())
                    .dateDepart(l.getDateDepart())
                    .nombrePlaces(l.getNombrePlaces())
                    .prixUnitaire(l.getPrixUnitaire())
                    .prixTotal(l.getPrixTotal())
                    .build();
        }
    }

    @Data @Builder
    public static class ChambreInfo {
        private String id;
        private String numero;
        private String type;
        private BigDecimal prixParNuit;
        private Integer capacite;
        private String imageUrl;
        private String description;

        public static ChambreInfo from(Chambre c) {
            if (c == null) return null;
            return ChambreInfo.builder()
                    .id(c.getId())
                    .numero(c.getNumero())
                    .type(c.getType() != null ? c.getType().name() : null)
                    .prixParNuit(c.getPrixParNuit())
                    .capacite(c.getCapacite())
                    .imageUrl(c.getImageUrl())
                    .description(c.getDescription())
                    .build();
        }
    }

    @Data @Builder
    public static class TrajetInfo {
        private String id;
        private String lieuDepart;
        private String lieuArrivee;
        private LocalDateTime dateDepart;
        private LocalDateTime dateArrivee;
        private String typeTransport;
        private BigDecimal prixParPlace;
        private Integer placesDisponibles;
        private Integer placesTotal;

        public static TrajetInfo from(Trajet t) {
            if (t == null) return null;
            return TrajetInfo.builder()
                    .id(t.getId())
                    .lieuDepart(t.getLieuDepart())
                    .lieuArrivee(t.getLieuArrivee())
                    .dateDepart(t.getDateDepart())
                    .dateArrivee(t.getDateArrivee())
                    .typeTransport(t.getTypeTransport() != null ? t.getTypeTransport().name() : null)
                    .prixParPlace(t.getPrixParPlace())
                    .placesDisponibles(t.getPlacesDisponibles())
                    .placesTotal(t.getPlacesTotal())
                    .build();
        }
    }
}