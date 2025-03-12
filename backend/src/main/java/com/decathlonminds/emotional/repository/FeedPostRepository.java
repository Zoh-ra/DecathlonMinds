package com.decathlonminds.emotional.repository;

import com.decathlonminds.emotional.model.FeedPost;
import com.decathlonminds.emotional.model.PostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedPostRepository extends JpaRepository<FeedPost, UUID> {
    
    List<FeedPost> findAllByOrderByCreatedAtDesc();
    
    List<FeedPost> findByTypeOrderByCreatedAtDesc(PostType type);
    
    List<FeedPost> findByWalkingRouteIdOrderByCreatedAtDesc(UUID walkingRouteId);
    
    List<FeedPost> findByTagsContainingOrderByCreatedAtDesc(String tag);
}
