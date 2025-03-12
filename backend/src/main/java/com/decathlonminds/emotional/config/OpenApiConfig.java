package com.decathlonminds.emotional.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DecathlonMinds Emotional Wellness API")
                        .description("API pour accompagner les utilisateurs à mieux comprendre et gérer leur état émotionnel " +
                                "et proposer des parcours de marche adaptés à leurs besoins.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("DecathlonMinds Team")
                                .email("contact@decathlonminds.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://decathlonminds.com")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080" + contextPath)
                                .description("Serveur de développement")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token d'authentification. Préfixez la valeur avec 'Bearer '"))
                );
    }
}
