package com.decathlonminds.emotional.service;

import com.decathlonminds.emotional.dto.ChatConversationDto;
import com.decathlonminds.emotional.model.ChatConversation;
import com.decathlonminds.emotional.model.User;
import com.decathlonminds.emotional.repository.ChatConversationRepository;
import com.decathlonminds.emotional.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatConversationRepository chatConversationRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatService(ChatConversationRepository chatConversationRepository, UserRepository userRepository) {
        this.chatConversationRepository = chatConversationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Sauvegarde une nouvelle conversation du chatbot
     */
    @Transactional
    public ChatConversationDto saveConversation(ChatConversationDto conversationDto) {
        // Dans une implémentation réelle, on vérifierait si l'utilisateur existe
        // et on le créerait si nécessaire
        User user;
        if (conversationDto.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(conversationDto.getUserId());
            user = userOpt.orElseGet(() -> getOrCreateDefaultUser());
        } else {
            user = getOrCreateDefaultUser();
        }

        ChatConversation chatConversation = new ChatConversation();
        chatConversation.setUser(user);
        chatConversation.setUserMessage(conversationDto.getUserMessage());
        chatConversation.setBotResponse(conversationDto.getBotResponse());
        chatConversation.setEmotion(conversationDto.getEmotion());
        chatConversation.setReason(conversationDto.getReason());
        chatConversation.setTimestamp(ZonedDateTime.now());

        ChatConversation savedConversation = chatConversationRepository.save(chatConversation);
        return convertToDto(savedConversation);
    }

    /**
     * Récupère les conversations d'un utilisateur
     */
    public List<ChatConversationDto> getConversationsByUser(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
        }

        List<ChatConversation> conversations = chatConversationRepository.findByUserOrderByTimestampDesc(userOpt.get());
        return conversations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les conversations d'un utilisateur par période
     */
    public List<ChatConversationDto> getConversationsByUserAndPeriod(UUID userId, ZonedDateTime start, ZonedDateTime end) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
        }

        List<ChatConversation> conversations = chatConversationRepository.findByUserAndTimestampBetween(userOpt.get(), start, end);
        return conversations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Génère une citation rassurante basée sur l'émotion et la raison
     */
    public String generateReassuranceQuote(String emotion, String reason) {
        // Logique simplifiée pour générer une citation
        // Dans une implémentation complète, cette logique pourrait être plus sophistiquée
        // ou utiliser une API externe comme OpenAI
        
        if ("HAPPY".equalsIgnoreCase(emotion)) {
            if ("WORK".equalsIgnoreCase(reason)) {
                return "Votre satisfaction au travail est une grande source de bonheur. Continuez à cultiver cet accomplissement !";
            } else if ("LOVE".equalsIgnoreCase(reason)) {
                return "L'amour est une force puissante qui illumine votre journée. Chérissez ces moments précieux.";
            } else {
                return "Le bonheur que vous ressentez est une force positive. Savourez pleinement ces instants !";
            }
        } else if ("SAD".equalsIgnoreCase(emotion)) {
            if ("WORK".equalsIgnoreCase(reason)) {
                return "Les défis professionnels font partie du chemin. Chaque obstacle surmonté est une victoire personnelle.";
            } else if ("LOVE".equalsIgnoreCase(reason)) {
                return "Les moments difficiles en amour nous enseignent beaucoup sur nous-mêmes. Prenez soin de votre cœur.";
            } else {
                return "La tristesse aussi est passagère. Prenez le temps de l'accueillir, puis laissez-la s'en aller doucement.";
            }
        } else if ("ANGRY".equalsIgnoreCase(emotion)) {
            return "Respirez profondément. La colère est comme un nuage passager dans votre ciel intérieur.";
        } else if ("ANXIOUS".equalsIgnoreCase(emotion)) {
            return "Une étape à la fois. Vous faites de votre mieux et c'est déjà beaucoup.";
        } else if ("TIRED".equalsIgnoreCase(emotion)) {
            return "Accordez-vous le repos que vous méritez. Demain est un autre jour.";
        } else {
            return "Chaque émotion a sa valeur et son message. Écoutez ce que celle-ci veut vous dire.";
        }
    }

    /**
     * Convertit un modèle ChatConversation en DTO
     */
    private ChatConversationDto convertToDto(ChatConversation conversation) {
        ChatConversationDto dto = new ChatConversationDto();
        dto.setId(conversation.getId());
        dto.setUserId(conversation.getUser().getId());
        dto.setUserMessage(conversation.getUserMessage());
        dto.setBotResponse(conversation.getBotResponse());
        dto.setEmotion(conversation.getEmotion());
        dto.setReason(conversation.getReason());
        dto.setTimestamp(conversation.getTimestamp());
        return dto;
    }

    /**
     * Récupère ou crée un utilisateur par défaut pour les conversations anonymes
     */
    private User getOrCreateDefaultUser() {
        // Dans une implémentation réelle, on pourrait créer un utilisateur anonyme
        // ou utiliser un utilisateur système pour les conversations non authentifiées
        return userRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                .orElseThrow(() -> new RuntimeException("Utilisateur par défaut non trouvé"));
    }
}
