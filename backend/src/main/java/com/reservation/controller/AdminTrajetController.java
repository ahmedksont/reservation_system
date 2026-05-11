package com.reservation.controller;

import com.reservation.entity.Trajet;
import com.reservation.exception.ResourceNotFoundException;
import com.reservation.repository.TrajetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/admin/trajets")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminTrajetController {

    private final TrajetRepository trajetRepository;

    @GetMapping
    public ResponseEntity<Page<Trajet>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                trajetRepository.findAll(pageable)
        );
    }

    @PostMapping
    public ResponseEntity<Trajet> create(
            @RequestBody Trajet trajet) {

        trajet.setPlacesDisponibles(trajet.getPlacesTotal());

        return ResponseEntity.ok(
                trajetRepository.save(trajet)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trajet> update(
            @PathVariable String id,
            @RequestBody Trajet update) {

        Trajet trajet = trajetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trajet non trouvé"));

        trajet.setLieuDepart(update.getLieuDepart());
        trajet.setLieuArrivee(update.getLieuArrivee());
        trajet.setDateDepart(update.getDateDepart());
        trajet.setDateArrivee(update.getDateArrivee());
        trajet.setTypeTransport(update.getTypeTransport());
        trajet.setPrixParPlace(update.getPrixParPlace());
        trajet.setPlacesTotal(update.getPlacesTotal());
        trajet.setPlacesDisponibles(update.getPlacesDisponibles());
        trajet.setNumeroVehicule(update.getNumeroVehicule());

        return ResponseEntity.ok(
                trajetRepository.save(trajet)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {

        Trajet trajet = trajetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trajet non trouvé"));

        trajetRepository.delete(trajet);

        return ResponseEntity.noContent().build();
    }
}