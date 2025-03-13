package com.decathlonminds.emotional.service;

import com.decathlonminds.emotional.dto.PostDTO;
import com.decathlonminds.emotional.model.Post;
import com.decathlonminds.emotional.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;

    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // Récupérer tous les posts
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // Récupérer un post par ID
    public Optional<PostDTO> getPostById(UUID id) {
        return postRepository.findById(id)
                .map(PostDTO::new);
    }

    // Créer un nouveau post
    @Transactional
    public PostDTO createPost(PostDTO postDTO) {
        Post post = postDTO.toEntity();
        Post savedPost = postRepository.save(post);
        return new PostDTO(savedPost);
    }

    // Mettre à jour un post existant
    @Transactional
    public Optional<PostDTO> updatePost(UUID id, PostDTO postDTO) {
        return postRepository.findById(id)
                .map(existingPost -> {
                    // Mise à jour des champs
                    existingPost.setType(postDTO.getType());
                    existingPost.setTitle(postDTO.getTitle());
                    existingPost.setContent(postDTO.getContent());
                    existingPost.setImageUrl(postDTO.getImageUrl());
                    existingPost.setAuthor(postDTO.getAuthor());
                    existingPost.setDate(postDTO.getDate());
                    existingPost.setSource(postDTO.getSource());
                    existingPost.setLocation(postDTO.getLocation());
                    existingPost.setDistance(postDTO.getDistance());
                    existingPost.setDuration(postDTO.getDuration());
                    existingPost.setDifficulty(postDTO.getDifficulty());
                    existingPost.setBackgroundColor(postDTO.getBackgroundColor());
                    existingPost.setRegistrationLink(postDTO.getRegistrationLink());
                    existingPost.setEmotion(postDTO.getEmotion());
                    existingPost.setCause(postDTO.getCause());
                    existingPost.setTags(postDTO.getTags());
                    
                    Post updatedPost = postRepository.save(existingPost);
                    return new PostDTO(updatedPost);
                });
    }

    // Supprimer un post
    @Transactional
    public boolean deletePost(UUID id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Filtrer les posts par émotion, cause et type
    public List<PostDTO> getFilteredPosts(String emotion, String cause, String type) {
        return postRepository.findByFilters(emotion, cause, type).stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // Trouver les posts par type
    public List<PostDTO> getPostsByType(String type) {
        return postRepository.findByType(type).stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // Trouver les posts par émotion
    public List<PostDTO> getPostsByEmotion(String emotion) {
        return postRepository.findByEmotion(emotion).stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // Trouver les posts par cause
    public List<PostDTO> getPostsByCause(String cause) {
        return postRepository.findByCause(cause).stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // Trouver les posts par tag
    public List<PostDTO> getPostsByTag(String tag) {
        return postRepository.findByTag(tag).stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }
}
