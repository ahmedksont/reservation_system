package com.reservation.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationRequest {

    // Hotel
    private String chambreId;

    @Future
    private LocalDate dateArrivee;

    @Future
    private LocalDate dateDepart;

    // Transport
    private String trajetId;

    @Min(1)
    private Integer nombrePlaces;

    private String notes;
}
