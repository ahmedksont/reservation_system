package com.reservation.controller;

import com.reservation.dto.request.LoginRequest;
import com.reservation.dto.request.RegisterRequest;
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
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (clientRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Un compte existe déjà avec cet email");
        }

        Client client = Client.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail().toLowerCase())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .role(Client.Role.CLIENT)
                .actif(true)
                .build();

        client = clientRepository.save(client);
        String token = jwtService.generateToken(client);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserInfo.from(client))
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Client client = clientRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BusinessException("Identifiants incorrects"));

        if (!client.getActif()) {
            throw new BusinessException("Compte désactivé. Contactez le support.");
        }

        if (!passwordEncoder.matches(request.getMotDePasse(), client.getMotDePasse())) {
            throw new BusinessException("Identifiants incorrects");
        }

        String token = jwtService.generateToken(client);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserInfo.from(client))
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserInfo> me(
            @AuthenticationPrincipal String clientId) {

        if (clientId == null) {
            throw new BusinessException("Utilisateur non authentifié");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));

        return ResponseEntity.ok(AuthResponse.UserInfo.from(client));
    }
    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal String clientId) {
        clientRepository.deleteById(clientId);
        return ResponseEntity.noContent().build();
    }
}