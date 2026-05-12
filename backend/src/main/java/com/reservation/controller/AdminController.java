package com.reservation.controller;

import com.reservation.dto.request.AdminUpdateUserRequest;
import com.reservation.dto.response.AuthResponse;
import com.reservation.entity.Client;
import com.reservation.exception.BusinessException;
import com.reservation.repository.ChambreRepository;
import com.reservation.repository.ClientRepository;
import com.reservation.repository.ReservationRepository;
import com.reservation.repository.TrajetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ClientRepository clientRepository;
    private final ReservationRepository reservationRepository;
    private final ChambreRepository chambreRepository;
    private final TrajetRepository trajetRepository;
    private final PasswordEncoder passwordEncoder;  // Supprimé la seconde déclaration de clientRepository

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        LocalDateTime debutAnnee = LocalDateTime.now().withDayOfYear(1).withHour(0);

        BigDecimal revenu = reservationRepository.getTotalRevenu(debutAnnee, LocalDateTime.now());
        List<Object[]> statuts = reservationRepository.getStatistiquesParStatut();
        List<Object[]> revenus = reservationRepository.getRevenusParMois(
                LocalDateTime.now().minusMonths(6)
        );

        long totalReservations = reservationRepository.count();
        long totalClients = clientRepository.count();
        long chambresDisponibles = chambreRepository.countDisponibles();

        Map<String, Object> stats = Map.of(
                "totalClients",      totalClients,
                "totalReservations", totalReservations,
                "reservationsConfirmees", statuts.stream()
                        .filter(s -> "CONFIRMEE".equals(s[0]))
                        .mapToLong(s -> (Long) s[1]).sum(),
                "revenuTotal",    revenu != null ? revenu : BigDecimal.ZERO,
                "chambresDisponibles", chambresDisponibles,
                "repartitionStatuts", statuts.stream().map(s -> Map.of(
                        "statut", s[0], "count", s[1]
                )).collect(Collectors.toList()),
                "revenusMensuels", revenus.stream().map(r -> Map.of(
                        "mois", r[0], "count", r[1], "revenu", r[2]
                )).collect(Collectors.toList())
        );

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/clients")
    public ResponseEntity<Page<AuthResponse.UserInfo>> getClients(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                clientRepository.findAll(pageable).map(AuthResponse.UserInfo::from)
        );
    }

    @PutMapping("/clients/{id}/desactiver")
    public ResponseEntity<AuthResponse.UserInfo> desactiverClient(@PathVariable String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Client non trouvé"));
        client.setActif(!client.getActif());
        client = clientRepository.save(client);
        return ResponseEntity.ok(AuthResponse.UserInfo.from(client));
    }

    /**
     * GET /api/admin/users - Liste de tous les utilisateurs (sans pagination)
     */
    @GetMapping("/users")
    public ResponseEntity<List<AuthResponse.UserInfo>> getAllUsers() {
        List<AuthResponse.UserInfo> users = clientRepository.findAll()
                .stream()
                .map(AuthResponse.UserInfo::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/admin/users/{id} - Détails d'un utilisateur
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<AuthResponse.UserInfo> getUserById(@PathVariable String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        return ResponseEntity.ok(AuthResponse.UserInfo.from(client));
    }

    /**
     * PUT /api/admin/users/{id} - Modifier un utilisateur
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<AuthResponse.UserInfo> updateUser(
            @PathVariable String id,
            @RequestBody AdminUpdateUserRequest request) {

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        // Vérifier l'unicité de l'email
        if (request.getEmail() != null && !request.getEmail().equals(client.getEmail())) {
            if (clientRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Cet email est déjà utilisé");
            }
            client.setEmail(request.getEmail().toLowerCase());
        }

        if (request.getNom() != null) {
            client.setNom(request.getNom());
        }
        if (request.getPrenom() != null) {
            client.setPrenom(request.getPrenom());
        }
        if (request.getTelephone() != null) {
            client.setTelephone(request.getTelephone());
        }
        if (request.getRole() != null) {
            client.setRole(Client.Role.valueOf(request.getRole()));
        }
        if (request.getActif() != null) {
            client.setActif(request.getActif());
        }

        client = clientRepository.save(client);

        return ResponseEntity.ok(AuthResponse.UserInfo.from(client));
    }

    /**
     * DELETE /api/admin/users/{id} - Supprimer un utilisateur
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        clientRepository.delete(client);

        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/admin/users/{id}/reset-password - Réinitialiser le mot de passe
     */
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        String defaultPassword = "password123";
        client.setMotDePasse(passwordEncoder.encode(defaultPassword));
        clientRepository.save(client);

        return ResponseEntity.ok().build();
    }
}