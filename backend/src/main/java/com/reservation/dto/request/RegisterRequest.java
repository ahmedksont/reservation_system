package com.reservation.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String nom;

    @NotBlank @Size(min = 2, max = 100)
    private String prenom;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 6, max = 100)
    private String motDePasse;

    private String telephone;
}
