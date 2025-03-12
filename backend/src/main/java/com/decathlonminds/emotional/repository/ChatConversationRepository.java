package com.decathlonminds.emotional.repository;

import com.decathlonminds.emotional.model.ChatConversation;
import com.decathlonminds.emotional.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {
    
    /**
     * Recherche des conversations par utilisateur
     */
    List<ChatConversation> findByUser(User user);
    
    /**
     * Recherche des conversations par utilisateur et triées par date
     */
    List<ChatConversation> findByUserOrderByTimestampDesc(User user);
    
    /**
     * Recherche des conversations par période
     */
    List<ChatConversation> findByUserAndTimestampBetween(User user, ZonedDateTime start, ZonedDateTime end);
    
    /**
     * Recherche des conversations par émotion
     */
    List<ChatConversation> findByUserAndEmotion(User user, String emotion);
    
    /**
     * Compter le nombre de conversations par utilisateur
     */
    long countByUser(User user);
}
