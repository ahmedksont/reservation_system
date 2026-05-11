package com.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chambres", indexes = {
    @Index(name = "idx_chambre_type", columnList = "type"),
    @Index(name = "idx_chambre_prix", columnList = "prix_par_nuit")
})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 20, unique = true)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeChambre type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixParNuit;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacite = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean disponible = true;

    @ElementCollection
    @CollectionTable(name = "chambre_equipements", joinColumns = @JoinColumn(name = "chambre_id"))
    @Column(name = "equipement")
    @Builder.Default
    private List<String> equipements = new ArrayList<>();

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer etage = 1;

    // Optimistic Locking pour la concurrence
    @Version
    private Long version;

    @OneToMany(mappedBy = "chambre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LigneReservation> lignesReservation = new ArrayList<>();

    public enum TypeChambre {
        SIMPLE, DOUBLE, SUITE, PENTHOUSE, FAMILIALE
    }
}
