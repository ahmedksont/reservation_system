package com.reservation.dto.request;

import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
    private Boolean actif;
}