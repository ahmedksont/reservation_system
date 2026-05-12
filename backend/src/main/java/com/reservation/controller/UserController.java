package com.reservation.controller;

import com.reservation.dto.request.ChangePasswordRequest;
import com.reservation.dto.request.UpdateProfileRequest;
import com.reservation.dto.response.AuthResponse;
import com.reservation.entity.Client;
import com.reservation.exception.BusinessException;
import com.reservation.repository.ClientRepository;
import com.reservation.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * GET /api/user/profile - Récupérer le profil de l'utilisateur connecté
     */
    @GetMapping("/profile")
    public ResponseEntity<AuthResponse.UserInfo> getProfile(
            @AuthenticationPrincipal String clientId) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        return ResponseEntity.ok(AuthResponse.UserInfo.from(client));
    }

    /**
     * PUT /api/user/profile - Mettre à jour le profil
     */
    @PutMapping("/profile")
    public ResponseEntity<AuthResponse.UserInfo> updateProfile(
            @AuthenticationPrincipal String clientId,
            @Valid @RequestBody UpdateProfileRequest request) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
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

        client = clientRepository.save(client);

        // Générer un nouveau token avec les infos mises à jour
        String newToken = jwtService.generateToken(client);

        return ResponseEntity.ok(AuthResponse.UserInfo.from(client));
    }

    /**
     * POST /api/user/change-password - Changer le mot de passe
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal String clientId,
            @Valid @RequestBody ChangePasswordRequest request) {

        // Vérifier que les nouveaux mots de passe correspondent
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Les nouveaux mots de passe ne correspondent pas");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(request.getCurrentPassword(), client.getMotDePasse())) {
            throw new BusinessException("Mot de passe actuel incorrect");
        }

        // Mettre à jour le mot de passe
        client.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        clientRepository.save(client);

        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteOwnAccount(@AuthenticationPrincipal String clientId) {
        clientRepository.deleteById(clientId);
        return ResponseEntity.noContent().build();
    }
}