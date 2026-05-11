package com.reservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * Prevent recursion:
     * Reservation -> Client -> Reservations -> ...
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnore
    private Client client;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutReservation statut = StatutReservation.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutPaiement statutPaiement = StatutPaiement.EN_ATTENTE;

    @Column(precision = 10, scale = 2)
    private BigDecimal montantTotal;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "stripe_client_secret")
    private String stripeClientSecret;

    @Column(length = 500)
    private String notes;

    @Column(name = "annulee_at")
    private LocalDateTime annuleeAt;

    /**
     * Prevent recursion:
     * Reservation -> Lignes -> Reservation -> ...
     */
    @OneToMany(
            mappedBy = "reservation",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    @JsonIgnore
    @Builder.Default
    private List<LigneReservation> lignes = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum StatutReservation {
        EN_ATTENTE,
        CONFIRMEE,
        ANNULEE,
        TERMINEE
    }

    public enum StatutPaiement {
        EN_ATTENTE,
        PAYE,
        REMBOURSE,
        ECHOUE
    }

    public void addLigne(LigneReservation ligne) {
        lignes.add(ligne);
        ligne.setReservation(this);
    }
}