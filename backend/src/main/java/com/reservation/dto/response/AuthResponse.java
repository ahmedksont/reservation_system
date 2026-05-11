package com.reservation.dto.response;

import com.reservation.entity.Client;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String token;
    private UserInfo user;

    @Data @Builder
    public static class UserInfo {
        private String id;
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String role;

        public static UserInfo from(Client client) {
            return UserInfo.builder()
                .id(client.getId())
                .nom(client.getNom())
                .prenom(client.getPrenom())
                .email(client.getEmail())
                .telephone(client.getTelephone())
                .role(client.getRole().name())
                .build();
        }
    }
}
