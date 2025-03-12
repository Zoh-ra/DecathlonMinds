package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "feed_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedPost {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType type;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String imageUrl;
    
    private String author;
    
    private String source;
    
    private String location;
    
    private Double distance;
    
    private Integer duration;
    
    @Enumerated(EnumType.STRING)
    private RouteDifficulty difficulty;
    
    private String backgroundColor;
    
    private String registrationLink;
    
    private ZonedDateTime date;
    
    @ElementCollection
    @CollectionTable(name = "feed_post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    @Column(nullable = false)
    private ZonedDateTime createdAt;
    
    @Column(nullable = false)
    private ZonedDateTime updatedAt;
    
    // Si c'est un parcours, on peut lier à un parcours existant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walking_route_id")
    private WalkingRoute walkingRoute;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = ZonedDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
