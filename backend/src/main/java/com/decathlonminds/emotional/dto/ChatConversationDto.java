package com.decathlonminds.emotional.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Représentation d'une conversation avec le chatbot")
public class ChatConversationDto {
    
    @Schema(description = "Identifiant de la conversation", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;
    
    @Schema(description = "Identifiant de l'utilisateur", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID userId;
    
    @Schema(description = "Message de l'utilisateur", example = "Comment puis-je améliorer mon humeur aujourd'hui ?")
    private String userMessage;
    
    @Schema(description = "Réponse du chatbot", example = "Une marche de 30 minutes pourrait vous aider à améliorer votre humeur.")
    private String botResponse;
    
    @Schema(description = "Émotion associée à la conversation", example = "HAPPY")
    private String emotion;
    
    @Schema(description = "Raison associée à l'émotion", example = "WORK")
    private String reason;
    
    @Schema(description = "Horodatage de la conversation", example = "2025-03-12T14:15:00+01:00")
    private ZonedDateTime timestamp;
}
