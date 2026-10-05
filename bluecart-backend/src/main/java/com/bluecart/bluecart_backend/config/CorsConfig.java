package com.bluecart.bluecart_backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        /*
         * React frontend
         */
        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        /*
         * HTTP methods used by Bluecart APIs
         */
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        /*
         * Headers allowed from the React frontend.
         *
         * Authorization is required for the JWT.
         * Content-Type is required for JSON requests.
         */
        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        /*
         * JWT is sent through the Authorization header,
         * not through cookies.
         */
        configuration.setAllowCredentials(false);

        /*
         * Apply this CORS configuration to all endpoints.
         */
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}