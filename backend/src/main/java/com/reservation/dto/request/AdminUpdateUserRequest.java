package com.reservation.dto.request;

import com.reservation.entity.Client;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {

    @Size(min = 2, max = 100)
    private String nom;

    @Size(min = 2, max = 100)
    private String prenom;

    @Email
    private String email;

    @Size(min = 10, max = 20)
    private String telephone;

    private Client.Role role;

    private Boolean actif;
}