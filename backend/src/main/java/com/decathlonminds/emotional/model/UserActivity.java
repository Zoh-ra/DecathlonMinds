package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivity {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private WalkingRoute route;
    
    @Column(name = "start_time", nullable = false)
    private ZonedDateTime startTime;
    
    @Column(name = "end_time")
    private ZonedDateTime endTime;
    
    @Column(name = "distance_covered_meters")
    private Integer distanceCoveredMeters;
    
    @Column(name = "average_pace_seconds")
    private Integer averagePaceSeconds;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "emotional_state_before")
    private EmotionType emotionalStateBefore;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "emotional_state_after")
    private EmotionType emotionalStateAfter;
    
    @Column(name = "weather_condition")
    private String weatherCondition;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
