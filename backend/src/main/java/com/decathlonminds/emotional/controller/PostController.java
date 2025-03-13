package com.decathlonminds.emotional.controller;

import com.decathlonminds.emotional.dto.PostDTO;
import com.decathlonminds.emotional.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    // Récupérer tous les posts
    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // Récupérer un post par ID
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable UUID id) {
        Optional<PostDTO> post = postService.getPostById(id);
        return post.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Créer un nouveau post
    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO postDTO) {
        PostDTO createdPost = postService.createPost(postDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    // Mettre à jour un post existant
    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable UUID id, @RequestBody PostDTO postDTO) {
        Optional<PostDTO> updatedPost = postService.updatePost(id, postDTO);
        return updatedPost.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Supprimer un post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        boolean deleted = postService.deletePost(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Filtrer les posts par émotion, cause et type
    @GetMapping("/filter")
    public ResponseEntity<List<PostDTO>> getFilteredPosts(
            @RequestParam(required = false) String emotion,
            @RequestParam(required = false) String cause,
            @RequestParam(required = false) String type) {
        List<PostDTO> posts = postService.getFilteredPosts(emotion, cause, type);
        return ResponseEntity.ok(posts);
    }

    // Trouver les posts par type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PostDTO>> getPostsByType(@PathVariable String type) {
        List<PostDTO> posts = postService.getPostsByType(type);
        return ResponseEntity.ok(posts);
    }

    // Trouver les posts par émotion
    @GetMapping("/emotion/{emotion}")
    public ResponseEntity<List<PostDTO>> getPostsByEmotion(@PathVariable String emotion) {
        List<PostDTO> posts = postService.getPostsByEmotion(emotion);
        return ResponseEntity.ok(posts);
    }

    // Trouver les posts par cause
    @GetMapping("/cause/{cause}")
    public ResponseEntity<List<PostDTO>> getPostsByCause(@PathVariable String cause) {
        List<PostDTO> posts = postService.getPostsByCause(cause);
        return ResponseEntity.ok(posts);
    }

    // Trouver les posts par tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<PostDTO>> getPostsByTag(@PathVariable String tag) {
        List<PostDTO> posts = postService.getPostsByTag(tag);
        return ResponseEntity.ok(posts);
    }
}
