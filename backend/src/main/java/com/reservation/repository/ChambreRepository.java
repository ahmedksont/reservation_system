package com.reservation.repository;

import com.reservation.entity.Chambre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChambreRepository extends JpaRepository<Chambre, String> {

    /**
     * JPQL - Recherche des chambres disponibles pour une période donnée
     * Exclut les chambres déjà réservées dans cet intervalle
     */
    @Query("""
        SELECT c FROM Chambre c
        WHERE c.disponible = true
        AND (:type IS NULL OR c.type = :type)
        AND c.capacite >= :capacite
        AND c.prixParNuit BETWEEN :prixMin AND :prixMax
        AND (
            :dateArrivee IS NULL 
            OR :dateDepart IS NULL 
            OR c.id NOT IN (
                SELECT lr.chambre.id FROM LigneReservation lr
                WHERE lr.chambre IS NOT NULL
                AND lr.reservation.statut IN ('EN_ATTENTE', 'CONFIRMEE')
                AND lr.dateDepart < :dateDepart 
                AND lr.dateArrivee > :dateArrivee
            )
        )
        ORDER BY c.prixParNuit ASC
    """)
    Page<Chambre> findChambresDisponibles(
            @Param("type") Chambre.TypeChambre type,
            @Param("capacite") Integer capacite,
            @Param("prixMin") BigDecimal prixMin,
            @Param("prixMax") BigDecimal prixMax,
            @Param("dateArrivee") LocalDate dateArrivee,
            @Param("dateDepart") LocalDate dateDepart,
            Pageable pageable
    );

    /**
     * Recherche des chambres disponibles sans dates (pour affichage général)
     */
    @Query("""
        SELECT c FROM Chambre c
        WHERE c.disponible = true
        AND (:type IS NULL OR c.type = :type)
        AND c.capacite >= :capacite
        AND c.prixParNuit BETWEEN :prixMin AND :prixMax
        ORDER BY c.prixParNuit ASC
    """)
    Page<Chambre> findChambresDisponiblesWithoutDates(
            @Param("type") Chambre.TypeChambre type,
            @Param("capacite") Integer capacite,
            @Param("prixMin") BigDecimal prixMin,
            @Param("prixMax") BigDecimal prixMax,
            Pageable pageable
    );

    /**
     * Recherche avec tri dynamique
     */
    @Query("""
        SELECT c FROM Chambre c
        WHERE c.disponible = true
        AND (:type IS NULL OR c.type = :type)
        AND c.capacite >= :capacite
        AND c.prixParNuit BETWEEN :prixMin AND :prixMax
        AND (
            :dateArrivee IS NULL 
            OR :dateDepart IS NULL 
            OR c.id NOT IN (
                SELECT lr.chambre.id FROM LigneReservation lr
                WHERE lr.chambre IS NOT NULL
                AND lr.reservation.statut IN ('EN_ATTENTE', 'CONFIRMEE')
                AND lr.dateDepart < :dateDepart 
                AND lr.dateArrivee > :dateArrivee
            )
        )
    """)
    Page<Chambre> findChambresDisponiblesWithSort(
            @Param("type") Chambre.TypeChambre type,
            @Param("capacite") Integer capacite,
            @Param("prixMin") BigDecimal prixMin,
            @Param("prixMax") BigDecimal prixMax,
            @Param("dateArrivee") LocalDate dateArrivee,
            @Param("dateDepart") LocalDate dateDepart,
            Pageable pageable
    );

    /**
     * Pessimistic Lock - bloque la chambre pour éviter la double réservation
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    @Query("SELECT c FROM Chambre c WHERE c.id = :id")
    Optional<Chambre> findByIdWithLock(@Param("id") String id);

    /**
     * Toutes les chambres disponibles sans filtres
     */
    @Query("SELECT c FROM Chambre c WHERE c.disponible = true ORDER BY c.prixParNuit ASC")
    Page<Chambre> findAllDisponibles(Pageable pageable);

    /**
     * Recherche par type
     */
    @Query("SELECT c FROM Chambre c WHERE c.disponible = true AND c.type = :type ORDER BY c.prixParNuit ASC")
    Page<Chambre> findByType(@Param("type") Chambre.TypeChambre type, Pageable pageable);

    /**
     * Recherche par prix max
     */
    @Query("SELECT c FROM Chambre c WHERE c.disponible = true AND c.prixParNuit <= :prixMax ORDER BY c.prixParNuit ASC")
    Page<Chambre> findByPrixMax(@Param("prixMax") BigDecimal prixMax, Pageable pageable);

    /**
     * Recherche par capacité
     */
    @Query("SELECT c FROM Chambre c WHERE c.disponible = true AND c.capacite >= :capacite ORDER BY c.prixParNuit ASC")
    Page<Chambre> findByCapaciteMin(@Param("capacite") Integer capacite, Pageable pageable);

    /**
     * Statistiques pour le dashboard admin
     */
    @Query("SELECT c.type, COUNT(c), AVG(c.prixParNuit) FROM Chambre c GROUP BY c.type")
    List<Object[]> getStatistiquesParType();

    /**
     * Compte des chambres disponibles
     */
    @Query("SELECT COUNT(c) FROM Chambre c WHERE c.disponible = true")
    Long countDisponibles();

    /**
     * Compte total des chambres
     */
    @Query("SELECT COUNT(c) FROM Chambre c")
    Long countTotal();

    /**
     * Vérifie si un numéro de chambre existe déjà
     */
    boolean existsByNumero(String numero);

    /**
     * Recherche les chambres par étage
     */
    @Query("SELECT c FROM Chambre c WHERE c.disponible = true AND c.etage = :etage ORDER BY c.numero ASC")
    List<Chambre> findByEtage(@Param("etage") Integer etage);

    /**
     * Recherche les chambres avec des équipements spécifiques
     */
    @Query("SELECT c FROM Chambre c WHERE c.disponible = true AND :equipement MEMBER OF c.equipements")
    Page<Chambre> findByEquipement(@Param("equipement") String equipement, Pageable pageable);

    /**
     * Recherche avancée avec tous les critères optionnels
     */
    @Query("""
        SELECT c FROM Chambre c
        WHERE c.disponible = true
        AND (:type IS NULL OR c.type = :type)
        AND (:capacite IS NULL OR c.capacite >= :capacite)
        AND (:prixMin IS NULL OR c.prixParNuit >= :prixMin)
        AND (:prixMax IS NULL OR c.prixParNuit <= :prixMax)
        AND (:etage IS NULL OR c.etage = :etage)
        AND (:equipement IS NULL OR :equipement MEMBER OF c.equipements)
        ORDER BY c.prixParNuit ASC
    """)
    Page<Chambre> searchChambres(
            @Param("type") Chambre.TypeChambre type,
            @Param("capacite") Integer capacite,
            @Param("prixMin") BigDecimal prixMin,
            @Param("prixMax") BigDecimal prixMax,
            @Param("etage") Integer etage,
            @Param("equipement") String equipement,
            Pageable pageable
    );

}