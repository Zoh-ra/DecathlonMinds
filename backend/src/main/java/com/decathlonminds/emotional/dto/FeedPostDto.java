package com.decathlonminds.emotional.dto;

import com.decathlonminds.emotional.model.PostType;
import com.decathlonminds.emotional.model.RouteDifficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedPostDto {
    private UUID id;
    private PostType type;
    private String title;
    private String content;
    private String imageUrl;
    private String author;
    private String source;
    private String location;
    private Double distance;
    private Integer duration;
    private RouteDifficulty difficulty;
    private String backgroundColor;
    private String registrationLink;
    private ZonedDateTime date;
    private List<String> tags = new ArrayList<>();
    private UUID walkingRouteId;
}
