package com.decathlonminds.emotional.dto;

import com.decathlonminds.emotional.model.Post;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class PostDTO {
    private UUID id;
    private String type;
    private String title;
    private String content;
    private String imageUrl;
    private String author;
    private String date;
    private String source;
    private String location;
    private Double distance;
    private Integer duration;
    private String difficulty;
    private String backgroundColor;
    private String registrationLink;
    private String emotion;
    private String cause;
    private Set<String> tags = new HashSet<>();

    // Constructeur vide
    public PostDTO() {
    }

    // Constructeur basé sur l'entité Post
    public PostDTO(Post post) {
        this.id = post.getId();
        this.type = post.getType();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imageUrl = post.getImageUrl();
        this.author = post.getAuthor();
        this.date = post.getDate();
        this.source = post.getSource();
        this.location = post.getLocation();
        this.distance = post.getDistance();
        this.duration = post.getDuration();
        this.difficulty = post.getDifficulty();
        this.backgroundColor = post.getBackgroundColor();
        this.registrationLink = post.getRegistrationLink();
        this.emotion = post.getEmotion();
        this.cause = post.getCause();
        this.tags = post.getTags();
    }

    // Méthode pour convertir DTO en entité
    public Post toEntity() {
        Post post = new Post();
        post.setType(this.type);
        post.setTitle(this.title);
        post.setContent(this.content);
        post.setImageUrl(this.imageUrl);
        post.setAuthor(this.author);
        post.setDate(this.date);
        post.setSource(this.source);
        post.setLocation(this.location);
        post.setDistance(this.distance);
        post.setDuration(this.duration);
        post.setDifficulty(this.difficulty);
        post.setBackgroundColor(this.backgroundColor);
        post.setRegistrationLink(this.registrationLink);
        post.setEmotion(this.emotion);
        post.setCause(this.cause);
        post.setTags(this.tags);
        return post;
    }

    // Getters et Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public String getRegistrationLink() {
        return registrationLink;
    }

    public void setRegistrationLink(String registrationLink) {
        this.registrationLink = registrationLink;
    }

    public Set<String> getTags() {
        return tags;
    }

    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    public String getEmotion() {
        return emotion;
    }

    public void setEmotion(String emotion) {
        this.emotion = emotion;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }
}
