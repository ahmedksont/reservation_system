package com.reservation.controller;

import com.reservation.dto.response.ChambreResponse;
import com.reservation.service.ChambreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/chambres")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminChambreController {

    private final ChambreService chambreService;

    /**
     * GET /api/admin/chambres
     * Liste paginée des chambres
     */
    @GetMapping
    public ResponseEntity<Page<ChambreResponse>> getAll(
            @PageableDefault(
                    size = 20,
                    sort = "numero",
                    direction = Sort.Direction.ASC
            ) Pageable pageable) {

        return ResponseEntity.ok(
                chambreService.getAll(pageable)
        );
    }

    /**
     * GET /api/admin/chambres/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChambreResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                chambreService.getById(id)
        );
    }

    /**
     * POST /api/admin/chambres
     */
    @PostMapping
    public ResponseEntity<ChambreResponse> create(
            @RequestBody ChambreResponse request) {

        return ResponseEntity.ok(
                chambreService.creer(request)
        );
    }

    /**
     * PUT /api/admin/chambres/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ChambreResponse> update(
            @PathVariable String id,
            @RequestBody ChambreResponse request) {

        return ResponseEntity.ok(
                chambreService.modifier(id, request)
        );
    }

    /**
     * DELETE /api/admin/chambres/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        chambreService.supprimer(id);

        return ResponseEntity.noContent().build();
    }
}