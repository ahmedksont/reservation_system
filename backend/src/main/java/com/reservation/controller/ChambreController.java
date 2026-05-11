package com.reservation.controller;

import com.reservation.dto.response.ChambreResponse;
import com.reservation.entity.Chambre;
import com.reservation.service.ChambreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/chambres")
@RequiredArgsConstructor
public class ChambreController {

    private final ChambreService chambreService;

    /**
     * GET /api/chambres/disponibles
     * Recherche des chambres disponibles avec filtres
     * Dates are now optional
     */
    @GetMapping("/disponibles")
    public ResponseEntity<Page<ChambreResponse>> getChambresDisponibles(
            @RequestParam(required = false) Chambre.TypeChambre type,
            @RequestParam(defaultValue = "1") Integer capacite,
            @RequestParam(defaultValue = "0") BigDecimal prixMin,
            @RequestParam(defaultValue = "10000") BigDecimal prixMax,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateArrivee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDepart,
            @PageableDefault(size = 12) Pageable pageable) {

        return ResponseEntity.ok(
                chambreService.rechercherDisponibles(type, capacite, prixMin, prixMax, dateArrivee, dateDepart, pageable)
        );
    }

    /**
     * GET /api/chambres
     * Liste toutes les chambres (admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ChambreResponse>> getAllChambres(
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(chambreService.getAll(pageable));
    }

    /**
     * GET /api/chambres/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChambreResponse> getChambre(@PathVariable String id) {
        return ResponseEntity.ok(chambreService.getById(id));
    }

    /**
     * POST /api/chambres (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChambreResponse> creerChambre(@RequestBody ChambreResponse request) {
        return ResponseEntity.ok(chambreService.creer(request));
    }

    /**
     * PUT /api/chambres/{id} (admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChambreResponse> modifierChambre(
            @PathVariable String id,
            @RequestBody ChambreResponse request) {
        return ResponseEntity.ok(chambreService.modifier(id, request));
    }
}