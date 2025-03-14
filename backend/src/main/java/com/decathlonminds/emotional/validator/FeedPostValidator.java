package com.decathlonminds.emotional.validator;

import com.decathlonminds.emotional.dto.FeedPostDto;
import com.decathlonminds.emotional.model.PostType;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service de validation des posts pour le feed
 * Assure le respect des règles métier importantes :
 * - Pas d'images avec des humains
 * - Événements avec dates futures (après 01/03/2025)
 * - Sources vérifiables pour les posts scientifiques
 */
@Component
public class FeedPostValidator {

    private static final ZonedDateTime MIN_EVENT_DATE = ZonedDateTime.parse("2025-03-01T00:00:00Z[UTC]");
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?|ftp)://[a-zA-Z0-9+&@#/%?=~_|!:,.;-]*[a-zA-Z0-9+&@#/%=~_|]");
    
    /**
     * Valide un post selon les règles métier
     * @param postDto Post à valider
     * @return Liste des erreurs de validation (vide si pas d'erreur)
     */
    public List<String> validatePost(FeedPostDto postDto) {
        List<String> validationErrors = new ArrayList<>();
        
        // Vérification des images contenant des humains (à implémenter avec un service d'IA)
        if (postDto.getImageUrl() != null && !postDto.getImageUrl().isEmpty()) {
            // Cette validation est une pseudo-vérification, en production il faudrait intégrer une API d'analyse d'image
            if (containsHumans(postDto.getImageUrl())) {
                validationErrors.add("Les images contenant des humains ne sont pas autorisées pour les posts");
            }
        }
        
        // Vérification de la date pour les événements (doit être après le 01/03/2025)
        if (PostType.EVENT.equals(postDto.getType())) {
            if (postDto.getDate() == null || postDto.getDate().isBefore(MIN_EVENT_DATE)) {
                validationErrors.add("Les événements doivent avoir une date future (après le 01/03/2025)");
            }
        }
        
        // Vérification des sources pour les posts scientifiques
        if (PostType.SCIENTIFIC.equals(postDto.getType())) {
            if (postDto.getSource() == null || postDto.getSource().isEmpty()) {
                validationErrors.add("Les posts scientifiques doivent avoir une source");
            } else if (!isValidUrl(postDto.getSource())) {
                validationErrors.add("La source doit être une URL valide");
            } else if (!isSourceAccessible(postDto.getSource())) {
                validationErrors.add("La source doit être accessible");
            }
        }
        
        return validationErrors;
    }
    
    /**
     * Détecte si une image contient des humains
     * Note: Dans un environnement de production, utilisez une API comme Google Cloud Vision,
     * Amazon Rekognition ou Microsoft Computer Vision pour cette vérification
     */
    private boolean containsHumans(String imageUrl) {
        // Implémentation simplifiée
        // En production, cette méthode devrait appeler une API d'analyse d'image
        // Par exemple:
        // return imageAnalysisService.detectHumans(imageUrl);
        
        // Pour le moment, nous utilisons une heuristique simple basée sur le nom de l'image
        String lowercaseUrl = imageUrl.toLowerCase();
        return lowercaseUrl.contains("person") || 
               lowercaseUrl.contains("people") || 
               lowercaseUrl.contains("human") ||
               lowercaseUrl.contains("portrait") ||
               lowercaseUrl.contains("face");
    }
    
    /**
     * Vérifie si une chaîne est une URL valide
     */
    private boolean isValidUrl(String urlString) {
        return URL_PATTERN.matcher(urlString).matches();
    }
    
    /**
     * Vérifie si une URL est accessible
     */
    private boolean isSourceAccessible(String urlString) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setInstanceFollowRedirects(true);
            
            int responseCode = connection.getResponseCode();
            return (responseCode >= 200 && responseCode < 400);
        } catch (Exception e) {
            return false;
        }
    }
}
