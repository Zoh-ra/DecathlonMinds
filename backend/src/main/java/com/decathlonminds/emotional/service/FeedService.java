package com.decathlonminds.emotional.service;

import com.decathlonminds.emotional.dto.FeedPostDto;
import com.decathlonminds.emotional.model.FeedPost;
import com.decathlonminds.emotional.model.PostType;
import com.decathlonminds.emotional.model.WalkingRoute;
import com.decathlonminds.emotional.repository.FeedPostRepository;
import com.decathlonminds.emotional.repository.WalkingRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeedService {

    private final FeedPostRepository feedPostRepository;
    private final WalkingRouteRepository walkingRouteRepository;

    @Autowired
    public FeedService(FeedPostRepository feedPostRepository, WalkingRouteRepository walkingRouteRepository) {
        this.feedPostRepository = feedPostRepository;
        this.walkingRouteRepository = walkingRouteRepository;
    }

    public List<FeedPostDto> getAllPosts() {
        return feedPostRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FeedPostDto> getPostsByType(PostType type) {
        return feedPostRepository.findByTypeOrderByCreatedAtDesc(type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FeedPostDto> getPostsByTag(String tag) {
        return feedPostRepository.findByTagsContainingOrderByCreatedAtDesc(tag).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<FeedPostDto> getPostById(UUID id) {
        return feedPostRepository.findById(id)
                .map(this::convertToDto);
    }

    @Transactional
    public FeedPostDto createPost(FeedPostDto postDto) {
        FeedPost post = convertToEntity(postDto);
        FeedPost savedPost = feedPostRepository.save(post);
        return convertToDto(savedPost);
    }

    @Transactional
    public Optional<FeedPostDto> updatePost(UUID id, FeedPostDto postDto) {
        if (!feedPostRepository.existsById(id)) {
            return Optional.empty();
        }
        
        FeedPost post = convertToEntity(postDto);
        post.setId(id);
        FeedPost updatedPost = feedPostRepository.save(post);
        return Optional.of(convertToDto(updatedPost));
    }

    @Transactional
    public boolean deletePost(UUID id) {
        if (!feedPostRepository.existsById(id)) {
            return false;
        }
        
        feedPostRepository.deleteById(id);
        return true;
    }

    private FeedPostDto convertToDto(FeedPost post) {
        FeedPostDto dto = new FeedPostDto();
        
        dto.setId(post.getId());
        dto.setType(post.getType());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setAuthor(post.getAuthor());
        dto.setSource(post.getSource());
        dto.setLocation(post.getLocation());
        dto.setDistance(post.getDistance());
        dto.setDuration(post.getDuration());
        dto.setDifficulty(post.getDifficulty());
        dto.setBackgroundColor(post.getBackgroundColor());
        dto.setRegistrationLink(post.getRegistrationLink());
        dto.setDate(post.getDate());
        dto.setTags(post.getTags());
        
        if (post.getWalkingRoute() != null) {
            dto.setWalkingRouteId(post.getWalkingRoute().getId());
        }
        
        return dto;
    }

    private FeedPost convertToEntity(FeedPostDto dto) {
        FeedPost post = new FeedPost();
        
        post.setType(dto.getType());
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setAuthor(dto.getAuthor());
        post.setSource(dto.getSource());
        post.setLocation(dto.getLocation());
        post.setDistance(dto.getDistance());
        post.setDuration(dto.getDuration());
        post.setDifficulty(dto.getDifficulty());
        post.setBackgroundColor(dto.getBackgroundColor());
        post.setRegistrationLink(dto.getRegistrationLink());
        post.setDate(dto.getDate() != null ? dto.getDate() : ZonedDateTime.now());
        post.setTags(dto.getTags());
        
        if (dto.getWalkingRouteId() != null) {
            walkingRouteRepository.findById(dto.getWalkingRouteId())
                    .ifPresent(post::setWalkingRoute);
        }
        
        return post;
    }
}
