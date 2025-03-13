package com.decathlonminds.emotional.repository;

import com.decathlonminds.emotional.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    
    // Trouver les posts par type
    List<Post> findByType(String type);
    
    // Trouver les posts par émotion
    List<Post> findByEmotion(String emotion);
    
    // Trouver les posts par cause
    List<Post> findByCause(String cause);
    
    // Trouver les posts par émotion et cause
    List<Post> findByEmotionAndCause(String emotion, String cause);
    
    // Trouver les posts par tag
    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t = :tag")
    List<Post> findByTag(@Param("tag") String tag);
    
    // Requête pour trouver des posts filtrés par émotion, cause et/ou type
    @Query("SELECT p FROM Post p WHERE " +
           "(:emotion IS NULL OR p.emotion = :emotion) AND " +
           "(:cause IS NULL OR p.cause = :cause) AND " +
           "(:type IS NULL OR p.type = :type)")
    List<Post> findByFilters(
            @Param("emotion") String emotion,
            @Param("cause") String cause,
            @Param("type") String type);
}
