package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "emotional_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmotionalEntry {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmotionType emotion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IntensityLevel intensity;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "triggers", columnDefinition = "text[]")
    private String[] triggers;
    
    @Column(name = "recorded_at")
    private ZonedDateTime recordedAt;
    
    @Column(name = "location_latitude", precision = 9, scale = 6)
    private BigDecimal locationLatitude;
    
    @Column(name = "location_longitude", precision = 9, scale = 6)
    private BigDecimal locationLongitude;
    
    @Column(name = "weather_condition")
    private String weatherCondition;
    
    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = ZonedDateTime.now();
        }
    }
}
