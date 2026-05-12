package com.reservation.dto.response;

import com.reservation.entity.Client;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String role;
        private Boolean actif;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static UserInfo from(Client client) {
            return UserInfo.builder()
                    .id(client.getId())
                    .nom(client.getNom())
                    .prenom(client.getPrenom())
                    .email(client.getEmail())
                    .telephone(client.getTelephone())
                    .role(client.getRole() != null ? client.getRole().name() : "CLIENT")
                    .actif(client.getActif())
                    .createdAt(client.getCreatedAt())
                    .updatedAt(client.getUpdatedAt())
                    .build();
        }
    }
}