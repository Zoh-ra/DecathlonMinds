package com.decathlonminds.emotional.controller;

import com.decathlonminds.emotional.dto.FeedPostDto;
import com.decathlonminds.emotional.model.PostType;
import com.decathlonminds.emotional.service.FeedService;
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
@RequestMapping("/feed")
@Tag(name = "Fil d'actualité", description = "API pour la gestion du fil d'actualité")
public class FeedController {

    private final FeedService feedService;

    @Autowired
    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @Operation(summary = "Récupérer toutes les publications", 
              description = "Renvoie toutes les publications du fil d'actualité triées par date de création (la plus récente d'abord)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publications trouvées",
                    content = @Content(schema = @Schema(implementation = FeedPostDto.class)))
    })
    @GetMapping
    public ResponseEntity<List<FeedPostDto>> getAllPosts() {
        List<FeedPostDto> posts = feedService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "Récupérer les publications par type", 
              description = "Renvoie les publications du fil d'actualité filtrées par type")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publications trouvées",
                    content = @Content(schema = @Schema(implementation = FeedPostDto.class)))
    })
    @GetMapping("/type/{type}")
    public ResponseEntity<List<FeedPostDto>> getPostsByType(
            @Parameter(description = "Type de publication", required = true)
            @PathVariable PostType type) {
        List<FeedPostDto> posts = feedService.getPostsByType(type);
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "Récupérer les publications par tag", 
              description = "Renvoie les publications du fil d'actualité contenant un tag spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publications trouvées",
                    content = @Content(schema = @Schema(implementation = FeedPostDto.class)))
    })
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<FeedPostDto>> getPostsByTag(
            @Parameter(description = "Tag à rechercher", required = true)
            @PathVariable String tag) {
        List<FeedPostDto> posts = feedService.getPostsByTag(tag);
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "Récupérer une publication par ID", 
              description = "Renvoie une publication spécifique par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publication trouvée",
                    content = @Content(schema = @Schema(implementation = FeedPostDto.class))),
        @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    })
    @GetMapping("/{id}")
    public ResponseEntity<FeedPostDto> getPostById(
            @Parameter(description = "ID de la publication", required = true)
            @PathVariable UUID id) {
        return feedService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Créer une nouvelle publication", 
              description = "Crée une nouvelle publication dans le fil d'actualité")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Publication créée avec succès",
                    content = @Content(schema = @Schema(implementation = FeedPostDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides")
    })
    @PostMapping
    public ResponseEntity<FeedPostDto> createPost(@Valid @RequestBody FeedPostDto postDto) {
        FeedPostDto createdPost = feedService.createPost(postDto);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @Operation(summary = "Mettre à jour une publication", 
              description = "Met à jour une publication existante par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Publication mise à jour avec succès",
                    content = @Content(schema = @Schema(implementation = FeedPostDto.class))),
        @ApiResponse(responseCode = "400", description = "Données d'entrée invalides"),
        @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    })
    @PutMapping("/{id}")
    public ResponseEntity<FeedPostDto> updatePost(
            @Parameter(description = "ID de la publication", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody FeedPostDto postDto) {
        return feedService.updatePost(id, postDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Supprimer une publication", 
              description = "Supprime une publication existante par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Publication supprimée avec succès"),
        @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @Parameter(description = "ID de la publication", required = true)
            @PathVariable UUID id) {
        boolean deleted = feedService.deletePost(id);
        return deleted 
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : ResponseEntity.notFound().build();
    }
}
