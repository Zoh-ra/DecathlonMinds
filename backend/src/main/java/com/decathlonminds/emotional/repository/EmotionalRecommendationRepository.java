package com.decathlonminds.emotional.repository;

import com.decathlonminds.emotional.model.EmotionalRecommendation;
import com.decathlonminds.emotional.model.EmotionType;
import com.decathlonminds.emotional.model.IntensityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmotionalRecommendationRepository extends JpaRepository<EmotionalRecommendation, UUID> {
    List<EmotionalRecommendation> findByEmotion(EmotionType emotion);
    List<EmotionalRecommendation> findByEmotionAndIntensity(EmotionType emotion, IntensityLevel intensity);
    
    // Note: Cette méthode sera implémentée manuellement dans un service
    // car la recherche dans un tableau nécessite une logique spécifique en JPA
    // qui dépend de la base de données sous-jacente
}
