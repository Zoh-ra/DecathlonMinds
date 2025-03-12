package com.decathlonminds.emotional.dto;

import com.decathlonminds.emotional.model.EmotionType;
import com.decathlonminds.emotional.model.IntensityLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Enregistrement d'un état émotionnel")
public class EmotionalEntryDto {
    
    @Schema(description = "Identifiant unique de l'entrée", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;
    
    @Schema(description = "Identifiant de l'utilisateur", required = true)
    @NotNull(message = "L'identifiant de l'utilisateur est obligatoire")
    private UUID userId;
    
    @Schema(description = "Type d'émotion ressenti", required = true, example = "HAPPY")
    @NotNull(message = "Le type d'émotion est obligatoire")
    private EmotionType emotion;
    
    @Schema(description = "Intensité de l'émotion", required = true, example = "MEDIUM")
    @NotNull(message = "L'intensité de l'émotion est obligatoire")
    private IntensityLevel intensity;
    
    @Schema(description = "Description détaillée de l'état émotionnel", example = "Je me sens bien après ma promenade")
    private String description;
    
    @Schema(description = "Facteurs déclencheurs de l'état émotionnel", example = "[\"Travail\", \"Fatigue\"]")
    private String[] triggers;
    
    @Schema(description = "Date et heure d'enregistrement", accessMode = Schema.AccessMode.READ_ONLY)
    private ZonedDateTime recordedAt;
    
    @Schema(description = "Latitude de la position géographique", example = "48.8566")
    private BigDecimal locationLatitude;
    
    @Schema(description = "Longitude de la position géographique", example = "2.3522")
    private BigDecimal locationLongitude;
    
    @Schema(description = "Conditions météorologiques", example = "SUNNY")
    private String weatherCondition;
}
