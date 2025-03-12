package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "emotional_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmotionalRecommendation {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmotionType emotion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IntensityLevel intensity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private WalkingRoute route;
    
    @Column(name = "recommendation_text", columnDefinition = "TEXT", nullable = false)
    private String recommendationText;
    
    @Column(name = "scientific_benefits", columnDefinition = "text[]")
    private String[] scientificBenefits;
    
    @Column(name = "weather_conditions", columnDefinition = "varchar(50)[]")
    private String[] weatherConditions;
    
    @Column(name = "created_at")
    private ZonedDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
