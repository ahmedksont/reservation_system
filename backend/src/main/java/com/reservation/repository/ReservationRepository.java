package com.reservation.repository;

import com.reservation.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {

    // Fetch JOIN pour éviter le N+1 problem
    @Query("""
        SELECT DISTINCT r FROM Reservation r
        LEFT JOIN FETCH r.lignes l
        LEFT JOIN FETCH l.chambre
        LEFT JOIN FETCH l.trajet
        WHERE r.client.id = :clientId
        ORDER BY r.createdAt DESC
    """)
    List<Reservation> findByClientIdWithDetails(@Param("clientId") String clientId);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.client.id = :clientId
        ORDER BY r.createdAt DESC
    """)
    Page<Reservation> findByClientId(@Param("clientId") String clientId, Pageable pageable);

    @Query("""
        SELECT DISTINCT r FROM Reservation r
        LEFT JOIN FETCH r.lignes l
        LEFT JOIN FETCH l.chambre
        LEFT JOIN FETCH l.trajet
        LEFT JOIN FETCH r.client
        WHERE r.id = :id
    """)
    Optional<Reservation> findByIdWithDetails(@Param("id") String id);

    // Statistiques revenus pour dashboard
    @Query("""
        SELECT SUM(r.montantTotal) FROM Reservation r
        WHERE r.statutPaiement = 'PAYE'
        AND r.createdAt BETWEEN :debut AND :fin
    """)
    BigDecimal getTotalRevenu(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("""
        SELECT r.statut, COUNT(r) FROM Reservation r
        GROUP BY r.statut
    """)
    List<Object[]> getStatistiquesParStatut();

    @Query("""
        SELECT MONTH(r.createdAt), COUNT(r), SUM(r.montantTotal)
        FROM Reservation r
        WHERE r.createdAt >= :debut
        AND r.statutPaiement = 'PAYE'
        GROUP BY MONTH(r.createdAt)
        ORDER BY MONTH(r.createdAt)
    """)
    List<Object[]> getRevenusParMois(@Param("debut") LocalDateTime debut);
}
