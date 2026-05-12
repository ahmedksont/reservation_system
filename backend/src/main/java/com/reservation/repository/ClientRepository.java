package com.reservation.repository;

import com.reservation.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {

    Optional<Client> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT c FROM Client c WHERE c.actif = true")
    Page<Client> findAllActifs(Pageable pageable);

    @Query("SELECT COUNT(c) FROM Client c WHERE c.role = :role")
    long countByRole(@Param("role") Client.Role role);
}