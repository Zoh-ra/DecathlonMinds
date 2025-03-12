package com.decathlonminds.emotional.controller;

import com.decathlonminds.emotional.dto.EmotionalEntryDto;
import com.decathlonminds.emotional.model.EmotionType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/emotional-entries")
@Tag(name = "États Émotionnels", description = "API pour la gestion des états émotionnels des utilisateurs")
public class EmotionalEntryController {

    @Operation(summary = "Enregistrer un nouvel état émotionnel", 
               description = "Permet à un utilisateur d'enregistrer son état émotionnel courant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "État émotionnel enregistré avec succès",
                     content = @Content(schema = @Schema(implementation = EmotionalEntryDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @PostMapping
    public ResponseEntity<EmotionalEntryDto> createEmotionalEntry(@Valid @RequestBody EmotionalEntryDto emotionalEntryDto) {
        // Simulation
        emotionalEntryDto.setId(UUID.randomUUID());
        emotionalEntryDto.setRecordedAt(ZonedDateTime.now());
        return new ResponseEntity<>(emotionalEntryDto, HttpStatus.CREATED);
    }

    @Operation(summary = "Récupérer un état émotionnel par ID", 
               description = "Récupère les détails d'un enregistrement d'état émotionnel spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "État émotionnel trouvé",
                     content = @Content(schema = @Schema(implementation = EmotionalEntryDto.class))),
        @ApiResponse(responseCode = "404", description = "Enregistrement non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<EmotionalEntryDto> getEmotionalEntryById(
            @Parameter(description = "ID de l'enregistrement à récupérer", required = true)
            @PathVariable UUID id) {
        // Simulation
        EmotionalEntryDto entry = new EmotionalEntryDto();
        entry.setId(id);
        entry.setUserId(UUID.randomUUID());
        entry.setEmotion(EmotionType.HAPPY);
        entry.setRecordedAt(ZonedDateTime.now().minusHours(1));
        return ResponseEntity.ok(entry);
    }

    @Operation(summary = "Récupérer les états émotionnels d'un utilisateur", 
               description = "Récupère tous les enregistrements d'états émotionnels pour un utilisateur donné")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des états émotionnels récupérée avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EmotionalEntryDto>> getEmotionalEntriesByUserId(
            @Parameter(description = "ID de l'utilisateur", required = true)
            @PathVariable UUID userId,
            @Parameter(description = "Date de début (optionnel)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Date de fin (optionnel)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Type d'émotion (optionnel)")
            @RequestParam(required = false) EmotionType emotionType) {
        
        // Simulation
        EmotionalEntryDto entry1 = new EmotionalEntryDto();
        entry1.setId(UUID.randomUUID());
        entry1.setUserId(userId);
        entry1.setEmotion(EmotionType.HAPPY);
        entry1.setRecordedAt(ZonedDateTime.now().minusHours(2));
        
        EmotionalEntryDto entry2 = new EmotionalEntryDto();
        entry2.setId(UUID.randomUUID());
        entry2.setUserId(userId);
        entry2.setEmotion(EmotionType.CALM);
        entry2.setRecordedAt(ZonedDateTime.now().minusHours(5));
        
        return ResponseEntity.ok(List.of(entry1, entry2));
    }

    @Operation(summary = "Mise à jour d'un état émotionnel", 
               description = "Permet de modifier un enregistrement d'état émotionnel existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "État émotionnel mis à jour avec succès",
                     content = @Content(schema = @Schema(implementation = EmotionalEntryDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides"),
        @ApiResponse(responseCode = "404", description = "Enregistrement non trouvé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<EmotionalEntryDto> updateEmotionalEntry(
            @Parameter(description = "ID de l'enregistrement à modifier", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody EmotionalEntryDto emotionalEntryDto) {
        // Simulation
        emotionalEntryDto.setId(id);
        return ResponseEntity.ok(emotionalEntryDto);
    }

    @Operation(summary = "Suppression d'un état émotionnel", 
               description = "Supprime un enregistrement d'état émotionnel")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "État émotionnel supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Enregistrement non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmotionalEntry(
            @Parameter(description = "ID de l'enregistrement à supprimer", required = true)
            @PathVariable UUID id) {
        // Simulation
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Récupérer les états émotionnels par localisation", 
               description = "Récupère les états émotionnels enregistrés à proximité d'une position géographique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des états émotionnels récupérée avec succès")
    })
    @GetMapping("/nearby")
    public ResponseEntity<List<EmotionalEntryDto>> getNearbyEmotionalEntries(
            @Parameter(description = "Latitude", required = true)
            @RequestParam BigDecimal latitude,
            @Parameter(description = "Longitude", required = true)
            @RequestParam BigDecimal longitude,
            @Parameter(description = "Rayon de recherche en mètres", required = true)
            @RequestParam int radiusMeters) {
        
        // Simulation
        EmotionalEntryDto entry = new EmotionalEntryDto();
        entry.setId(UUID.randomUUID());
        entry.setLocationLatitude(latitude.add(new BigDecimal("0.0001")));
        entry.setLocationLongitude(longitude.add(new BigDecimal("0.0001")));
        entry.setEmotion(EmotionType.HAPPY);
        
        return ResponseEntity.ok(List.of(entry));
    }
}
