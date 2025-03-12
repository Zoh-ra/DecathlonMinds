package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "walking_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalkingRoute {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false)
    private IntensityLevel difficultyLevel;
    
    @Column(name = "distance_meters", nullable = false)
    private Integer distanceMeters;
    
    @Column(name = "estimated_duration_minutes", nullable = false)
    private Integer estimatedDurationMinutes;
    
    @Column(name = "start_point_latitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal startPointLatitude;
    
    @Column(name = "start_point_longitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal startPointLongitude;
    
    @Column(name = "end_point_latitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal endPointLatitude;
    
    @Column(name = "end_point_longitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal endPointLongitude;
    
    @Column(name = "elevation_gain_meters")
    private Integer elevationGainMeters;
    
    @Column(name = "route_type")
    private String routeType;
    
    @Column(name = "created_at")
    private ZonedDateTime createdAt;
    
    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutePoint> routePoints = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
