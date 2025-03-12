package com.decathlonminds.emotional.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversation {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "user_message", columnDefinition = "TEXT")
    private String userMessage;
    
    @Column(name = "bot_response", columnDefinition = "TEXT")
    private String botResponse;
    
    @Column(name = "emotion")
    private String emotion;
    
    @Column(name = "reason")
    private String reason;
    
    @Column(name = "timestamp")
    private ZonedDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = ZonedDateTime.now();
        }
    }
}
