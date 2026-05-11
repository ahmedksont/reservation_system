package com.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trajets", indexes = {
    @Index(name = "idx_trajet_depart", columnList = "lieu_depart"),
    @Index(name = "idx_trajet_arrivee", columnList = "lieu_arrivee"),
    @Index(name = "idx_trajet_date", columnList = "date_depart")
})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String lieuDepart;

    @Column(nullable = false, length = 100)
    private String lieuArrivee;

    @Column(nullable = false)
    private LocalDateTime dateDepart;

    @Column(nullable = false)
    private LocalDateTime dateArrivee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTransport typeTransport;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixParPlace;

    @Column(nullable = false)
    private Integer placesTotal;

    @Column(nullable = false)
    @Builder.Default
    private Integer placesDisponibles = 0;

    @Column(length = 50)
    private String numeroVehicule;

    // Optimistic Locking
    @Version
    private Long version;

    @OneToMany(mappedBy = "trajet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LigneReservation> lignesReservation = new ArrayList<>();

    public enum TypeTransport {
        TRAIN, BUS, AVION, BATEAU
    }
}
