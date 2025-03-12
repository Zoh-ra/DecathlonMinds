package com.decathlonminds.emotional.dto;

import com.decathlonminds.emotional.model.IntensityLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Parcours de marche")
public class WalkingRouteDto {
    
    @Schema(description = "Identifiant unique du parcours", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;
    
    @NotBlank(message = "Le nom du parcours est obligatoire")
    @Schema(description = "Nom du parcours", example = "Parcours Zen du Parc", required = true)
    private String name;
    
    @Schema(description = "Description du parcours", example = "Un parcours tranquille à travers un parc paisible")
    private String description;
    
    @NotNull(message = "Le niveau de difficulté est obligatoire")
    @Schema(description = "Niveau de difficulté du parcours", example = "MEDIUM", required = true)
    private IntensityLevel difficultyLevel;
    
    @NotNull(message = "La distance est obligatoire")
    @Min(value = 1, message = "La distance doit être supérieure à 0")
    @Schema(description = "Distance en mètres", example = "3000", required = true)
    private Integer distanceMeters;
    
    @NotNull(message = "La durée estimée est obligatoire")
    @Min(value = 1, message = "La durée doit être supérieure à 0")
    @Schema(description = "Durée estimée en minutes", example = "45", required = true)
    private Integer estimatedDurationMinutes;
    
    @NotNull(message = "La latitude du point de départ est obligatoire")
    @Schema(description = "Latitude du point de départ", example = "48.8566", required = true)
    private BigDecimal startPointLatitude;
    
    @NotNull(message = "La longitude du point de départ est obligatoire")
    @Schema(description = "Longitude du point de départ", example = "2.3522", required = true)
    private BigDecimal startPointLongitude;
    
    @NotNull(message = "La latitude du point d'arrivée est obligatoire")
    @Schema(description = "Latitude du point d'arrivée", example = "48.8580", required = true)
    private BigDecimal endPointLatitude;
    
    @NotNull(message = "La longitude du point d'arrivée est obligatoire")
    @Schema(description = "Longitude du point d'arrivée", example = "2.3530", required = true)
    private BigDecimal endPointLongitude;
    
    @Schema(description = "Dénivelé positif en mètres", example = "50")
    private Integer elevationGainMeters;
    
    @Schema(description = "Type de parcours", example = "PARK_TRAIL")
    private String routeType;
}
