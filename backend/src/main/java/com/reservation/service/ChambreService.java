package com.reservation.service;

import com.reservation.dto.response.ChambreResponse;
import com.reservation.entity.Chambre;
import com.reservation.exception.ResourceNotFoundException;
import com.reservation.repository.ChambreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChambreService {

    private final ChambreRepository chambreRepository;

    @Transactional(readOnly = true)
    public Page<ChambreResponse> rechercherDisponibles(
            Chambre.TypeChambre type,
            Integer capacite,
            BigDecimal prixMin,
            BigDecimal prixMax,
            LocalDate dateArrivee,
            LocalDate dateDepart,
            Pageable pageable) {

        // If dates are NOT provided, don't filter by availability
        if (dateArrivee == null || dateDepart == null) {
            return chambreRepository.findChambresDisponiblesWithoutDates(
                    type, capacite, prixMin, prixMax, pageable
            ).map(ChambreResponse::from);
        }

        // Dates provided - filter by availability
        return chambreRepository.findChambresDisponibles(
                type, capacite, prixMin, prixMax, dateArrivee, dateDepart, pageable
        ).map(ChambreResponse::from);
    }
    @Transactional(readOnly = true)
    public Page<ChambreResponse> getAll(Pageable pageable) {
        return chambreRepository.findAll(pageable).map(ChambreResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ChambreResponse> getAllDisponibles(Pageable pageable) {
        return chambreRepository.findAllDisponibles(pageable).map(ChambreResponse::from);
    }

    @Transactional(readOnly = true)
    public ChambreResponse getById(String id) {
        return chambreRepository.findById(id)
                .map(ChambreResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée: " + id));
    }

    @Transactional
    public ChambreResponse creer(ChambreResponse request) {
        // Vérifier si le numéro existe déjà
        if (chambreRepository.existsByNumero(request.getNumero())) {
            throw new IllegalArgumentException("Une chambre avec le numéro " + request.getNumero() + " existe déjà");
        }

        Chambre chambre = Chambre.builder()
                .numero(request.getNumero())
                .type(Chambre.TypeChambre.valueOf(request.getType()))
                .prixParNuit(request.getPrixParNuit())
                .description(request.getDescription())
                .capacite(request.getCapacite())
                .disponible(true)
                .imageUrl(request.getImageUrl())
                .etage(request.getEtage())
                .equipements(request.getEquipements() != null ? request.getEquipements() : List.of())
                .build();

        return ChambreResponse.from(chambreRepository.save(chambre));
    }

    @Transactional
    public ChambreResponse modifier(String id, ChambreResponse request) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));

        if (request.getNumero() != null && !request.getNumero().equals(chambre.getNumero())) {
            if (chambreRepository.existsByNumero(request.getNumero())) {
                throw new IllegalArgumentException("Le numéro " + request.getNumero() + " est déjà utilisé");
            }
            chambre.setNumero(request.getNumero());
        }
        if (request.getDescription() != null) chambre.setDescription(request.getDescription());
        if (request.getPrixParNuit() != null) chambre.setPrixParNuit(request.getPrixParNuit());
        if (request.getDisponible() != null) chambre.setDisponible(request.getDisponible());
        if (request.getImageUrl() != null) chambre.setImageUrl(request.getImageUrl());
        if (request.getType() != null) chambre.setType(Chambre.TypeChambre.valueOf(request.getType()));
        if (request.getCapacite() != null) chambre.setCapacite(request.getCapacite());
        if (request.getEtage() != null) chambre.setEtage(request.getEtage());
        if (request.getEquipements() != null) chambre.setEquipements(request.getEquipements());

        return ChambreResponse.from(chambreRepository.save(chambre));
    }

    @Transactional
    public void supprimer(String id) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));

        // Vérifier s'il y a des réservations avant de supprimer
        if (chambre.getLignesReservation() != null && !chambre.getLignesReservation().isEmpty()) {
            throw new IllegalStateException("Impossible de supprimer une chambre qui a des réservations");
        }

        chambreRepository.delete(chambre);
    }

    @Transactional(readOnly = true)
    public Long countDisponibles() {
        return chambreRepository.countDisponibles();
    }

    @Transactional(readOnly = true)
    public List<Object[]> getStatistiquesParType() {
        return chambreRepository.getStatistiquesParType();
    }
}