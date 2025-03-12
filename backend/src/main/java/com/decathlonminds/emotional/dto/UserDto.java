package com.decathlonminds.emotional.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Représentation d'un utilisateur")
public class UserDto {
    
    @Schema(description = "Identifiant unique de l'utilisateur", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Schema(description = "Adresse email de l'utilisateur", example = "utilisateur@example.com", required = true)
    private String email;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Schema(description = "Mot de passe de l'utilisateur", example = "motDePasse123", required = true, accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;
    
    @Schema(description = "Prénom de l'utilisateur", example = "Jean")
    private String firstName;
    
    @Schema(description = "Nom de famille de l'utilisateur", example = "Dupont")
    private String lastName;
}
