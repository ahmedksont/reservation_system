package com.reservation.dto.response;

import com.reservation.entity.Chambre;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ChambreResponse {
    private String id;
    private String numero;
    private String type;
    private BigDecimal prixParNuit;
    private String description;
    private Integer capacite;
    private Boolean disponible;
    private List<String> equipements;
    private List<String> images;  // ✅ Liste d'images
    private String imageUrl;      // Gardé pour compatibilité (première image)
    private Integer etage;
    private Long version;

    public static ChambreResponse from(Chambre chambre) {
        return ChambreResponse.builder()
                .id(chambre.getId())
                .numero(chambre.getNumero())
                .type(chambre.getType().name())
                .prixParNuit(chambre.getPrixParNuit())
                .description(chambre.getDescription())
                .capacite(chambre.getCapacite())
                .disponible(chambre.getDisponible())
                .equipements(chambre.getEquipements())
                .images(chambre.getAllImages())  // ✅ Toutes les images
                .imageUrl(chambre.getFirstImage()) // ✅ Première image pour compatibilité
                .etage(chambre.getEtage())
                .version(chambre.getVersion())
                .build();
    }
}