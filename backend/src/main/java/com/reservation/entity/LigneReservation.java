package com.reservation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "lignes_reservation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    // Hotel
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chambre_id")
    private Chambre chambre;

    @Column(name = "date_arrivee")
    private LocalDate dateArrivee;

    @Column(name = "date_depart")
    private LocalDate dateDepart;

    // Transport
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trajet_id")
    private Trajet trajet;

    @Column
    private Integer nombrePlaces;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixTotal;

    @PrePersist @PreUpdate
    public void calculerPrixTotal() {
        if (chambre != null && dateArrivee != null && dateDepart != null) {
            long nuits = dateDepart.toEpochDay() - dateArrivee.toEpochDay();
            this.prixTotal = prixUnitaire.multiply(BigDecimal.valueOf(nuits));
        } else if (trajet != null && nombrePlaces != null) {
            this.prixTotal = prixUnitaire.multiply(BigDecimal.valueOf(nombrePlaces));
        }
    }
}
