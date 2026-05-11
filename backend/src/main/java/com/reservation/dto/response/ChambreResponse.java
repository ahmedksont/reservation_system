package com.reservation.dto.response;

import com.reservation.entity.Chambre;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class ChambreResponse {
    private String id;
    private String numero;
    private String type;
    private BigDecimal prixParNuit;
    private String description;
    private Integer capacite;
    private Boolean disponible;
    private List<String> equipements;
    private String imageUrl;
    private Integer etage;

    public static ChambreResponse from(Chambre c) {
        return ChambreResponse.builder()
            .id(c.getId())
            .numero(c.getNumero())
            .type(c.getType().name())
            .prixParNuit(c.getPrixParNuit())
            .description(c.getDescription())
            .capacite(c.getCapacite())
            .disponible(c.getDisponible())
            .equipements(c.getEquipements())
            .imageUrl(c.getImageUrl())
            .etage(c.getEtage())
            .build();
    }
}
