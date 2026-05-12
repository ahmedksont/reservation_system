package com.reservation.dto.request;

import lombok.Data;

@Data
public class AdminUpdateReservationRequest {
    private String statut;
    private String statutPaiement;
    private String notes;
}