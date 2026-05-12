package com.reservation.repository;

import com.reservation.entity.Trajet;
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
import java.util.Optional;

@Repository
public interface TrajetRepository extends JpaRepository<Trajet, String> {

    // Return ALL trajets, paginated
    @Query("SELECT t FROM Trajet t ORDER BY t.dateDepart ASC")
    Page<Trajet> findAllOrdered(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    @Query("SELECT t FROM Trajet t WHERE t.id = :id")
    Optional<Trajet> findByIdWithLock(@Param("id") String id);

    @Query("SELECT COUNT(t) FROM Trajet t WHERE t.placesDisponibles > 0")
    Long countDisponibles();

}