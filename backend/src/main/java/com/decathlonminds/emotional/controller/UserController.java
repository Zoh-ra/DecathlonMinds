package com.decathlonminds.emotional.controller;

import com.decathlonminds.emotional.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@Tag(name = "Utilisateurs", description = "API pour la gestion des utilisateurs")
public class UserController {

    @Operation(summary = "Inscription d'un nouvel utilisateur", 
               description = "Création d'un compte utilisateur avec les informations requises")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès",
                     content = @Content(schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides"),
        @ApiResponse(responseCode = "409", description = "Email déjà utilisé")
    })
    @PostMapping
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody UserDto userDto) {
        // Simulation - Dans une implémentation réelle, cela serait traité par un service
        userDto.setId(UUID.randomUUID());
        return new ResponseEntity<>(userDto, HttpStatus.CREATED);
    }

    @Operation(summary = "Récupération d'un utilisateur par ID", 
               description = "Récupère les détails d'un utilisateur à partir de son identifiant unique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur trouvé",
                     content = @Content(schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(
            @Parameter(description = "ID de l'utilisateur à récupérer", required = true)
            @PathVariable UUID id) {
        // Simulation
        UserDto user = new UserDto();
        user.setId(id);
        user.setEmail("user@example.com");
        user.setFirstName("Jean");
        user.setLastName("Dupont");
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Récupération de tous les utilisateurs", 
               description = "Récupère la liste de tous les utilisateurs dans le système (accès admin)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des utilisateurs récupérée avec succès"),
        @ApiResponse(responseCode = "403", description = "Accès interdit - Droits administrateur requis")
    })
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        // Simulation
        UserDto user1 = new UserDto(UUID.randomUUID(), "user1@example.com", null, "Jean", "Dupont");
        UserDto user2 = new UserDto(UUID.randomUUID(), "user2@example.com", null, "Marie", "Martin");
        return ResponseEntity.ok(List.of(user1, user2));
    }

    @Operation(summary = "Mise à jour d'un utilisateur", 
               description = "Met à jour les informations d'un utilisateur existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour avec succès",
                     content = @Content(schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @Parameter(description = "ID de l'utilisateur à modifier", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody UserDto userDto) {
        // Simulation
        userDto.setId(id);
        return ResponseEntity.ok(userDto);
    }

    @Operation(summary = "Suppression d'un utilisateur", 
               description = "Supprime un utilisateur du système")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Utilisateur supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID de l'utilisateur à supprimer", required = true)
            @PathVariable UUID id) {
        // Simulation
        return ResponseEntity.noContent().build();
    }
}
