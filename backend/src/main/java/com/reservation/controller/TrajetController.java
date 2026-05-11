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
@RequestMapping("/trajets")
@RequiredArgsConstructor
public class TrajetController {

    private final TrajetRepository trajetRepository;

    /**
     * GET /api/trajets — returns ALL trajets, no filtering
     */
    @GetMapping
    public ResponseEntity<Page<Trajet>> getTrajets(
            @PageableDefault(size = 20, sort = "dateDepart") Pageable pageable) {

        return ResponseEntity.ok(trajetRepository.findAllOrdered(pageable));
    }

    /**
     * GET /api/trajets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Trajet> getTrajet(@PathVariable String id) {
        return ResponseEntity.ok(
                trajetRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Trajet non trouvé: " + id))
        );
    }

    /**
     * POST /api/trajets (admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Trajet> creerTrajet(@RequestBody Trajet trajet) {
        trajet.setPlacesDisponibles(trajet.getPlacesTotal());
        return ResponseEntity.ok(trajetRepository.save(trajet));
    }

    /**
     * PUT /api/trajets/{id} (admin)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Trajet> modifierTrajet(@PathVariable String id, @RequestBody Trajet update) {
        Trajet trajet = trajetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trajet non trouvé"));
        trajet.setPrixParPlace(update.getPrixParPlace());
        trajet.setPlacesDisponibles(update.getPlacesDisponibles());
        return ResponseEntity.ok(trajetRepository.save(trajet));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerTrajet(@PathVariable String id) {
        Trajet trajet = trajetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trajet non trouvé"));
        trajetRepository.delete(trajet);
        return ResponseEntity.noContent().build();
    }
}