package com.decathlonminds.emotional.repository;

import com.decathlonminds.emotional.model.EmotionalEntry;
import com.decathlonminds.emotional.model.EmotionType;
import com.decathlonminds.emotional.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmotionalEntryRepository extends JpaRepository<EmotionalEntry, UUID> {
    List<EmotionalEntry> findByUser(User user);
    List<EmotionalEntry> findByUserAndRecordedAtBetween(User user, ZonedDateTime startDate, ZonedDateTime endDate);
    List<EmotionalEntry> findByUserAndEmotion(User user, EmotionType emotion);
}
