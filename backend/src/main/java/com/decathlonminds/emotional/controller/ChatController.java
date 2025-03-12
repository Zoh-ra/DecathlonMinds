package com.decathlonminds.emotional.controller;

import com.decathlonminds.emotional.dto.ChatConversationDto;
import com.decathlonminds.emotional.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/conversation")
@Tag(name = "Chatbot", description = "API pour la gestion des conversations du chatbot")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Operation(summary = "Enregistrer une nouvelle conversation", 
               description = "Permet d'enregistrer une interaction utilisateur-chatbot")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Conversation enregistrée avec succès",
                     content = @Content(schema = @Schema(implementation = ChatConversationDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @PostMapping
    public ResponseEntity<ChatConversationDto> saveConversation(@Valid @RequestBody ChatConversationDto conversationDto) {
        ChatConversationDto savedConversation = chatService.saveConversation(conversationDto);
        return new ResponseEntity<>(savedConversation, HttpStatus.CREATED);
    }

    @Operation(summary = "Récupérer les conversations par utilisateur", 
               description = "Récupère l'historique des conversations d'un utilisateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conversations trouvées",
                     content = @Content(schema = @Schema(implementation = ChatConversationDto.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatConversationDto>> getConversationsByUser(
            @Parameter(description = "ID de l'utilisateur", required = true)
            @PathVariable UUID userId) {
        List<ChatConversationDto> conversations = chatService.getConversationsByUser(userId);
        return ResponseEntity.ok(conversations);
    }

    @Operation(summary = "Générer une citation rassurante", 
               description = "Génère une citation rassurante basée sur l'émotion et la raison")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Citation générée avec succès")
    })
    @PostMapping("/quote")
    public ResponseEntity<Object> getReassuranceQuote(
            @RequestBody QuoteRequest request) {
        
        String quote = chatService.generateReassuranceQuote(request.getEmotion(), request.getReason());
        return ResponseEntity.ok(new QuoteResponse(quote));
    }
    
    // Classes internes pour les requêtes et réponses
    
    public static class QuoteRequest {
        private String emotion;
        private String reason;
        
        public String getEmotion() {
            return emotion;
        }
        
        public void setEmotion(String emotion) {
            this.emotion = emotion;
        }
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
    
    public static class QuoteResponse {
        private final String quote;
        
        public QuoteResponse(String quote) {
            this.quote = quote;
        }
        
        public String getQuote() {
            return quote;
        }
    }
}
