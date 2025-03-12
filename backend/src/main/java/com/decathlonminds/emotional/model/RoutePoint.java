package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "route_points", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"route_id", "sequence_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoutePoint {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private WalkingRoute route;
    
    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;
    
    @Column(precision = 9, scale = 6, nullable = false)
    private BigDecimal latitude;
    
    @Column(precision = 9, scale = 6, nullable = false)
    private BigDecimal longitude;
    
    @Column(name = "elevation_meters")
    private Integer elevationMeters;
}
