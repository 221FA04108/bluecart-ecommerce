package com.bluecart.bluecart_backend.config;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;


    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =====================================================
    // JWT SECRET KEY
    // =====================================================

    @Bean
    public SecretKey jwtSecretKey() {

        return new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );
    }


    // =====================================================
    // JWT ENCODER
    // =====================================================

    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey jwtSecretKey) {

        return NimbusJwtEncoder
                .withSecretKey(jwtSecretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }


    // =====================================================
    // JWT DECODER
    // =====================================================

    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey jwtSecretKey) {

        return NimbusJwtDecoder
                .withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

// =====================================================
// JWT ROLE / AUTHORITY CONVERTER
// =====================================================

@Bean
public Converter<Jwt, ? extends AbstractAuthenticationToken>
        jwtAuthenticationConverter() {

    return jwt -> {

        String role = jwt.getClaimAsString("role");

        Collection<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        return new JwtAuthenticationToken(
                jwt,
                authorities
        );
    };
}


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            Converter<Jwt, ? extends AbstractAuthenticationToken>
                    jwtAuthenticationConverter
    ) throws Exception {

        http

            // =================================================
            // REST API
            // =================================================

            .csrf(csrf ->
                csrf.disable()
            )


            // =================================================
            // JWT = STATELESS AUTHENTICATION
            // =================================================

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )


            // =================================================
            // DISABLE BROWSER LOGIN
            // =================================================

            .formLogin(form ->
                form.disable()
            )


            // =================================================
            // DISABLE HTTP BASIC
            // =================================================

            .httpBasic(basic ->
                basic.disable()
            )


            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(auth ->
                auth

                    // -----------------------------------------
                    // Customer registration
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/auth/register"
                    )
                    .permitAll()


                    // -----------------------------------------
                    // Customer / Admin login
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/auth/login"
                    )
                    .permitAll()


                    // -----------------------------------------
                    // MANAGEMENT APIs
                    // ADMIN ONLY
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/management/**"
                    )
                    .hasRole("ADMIN")


                    // -----------------------------------------
                    // Everything else requires JWT
                    // -----------------------------------------

                    .anyRequest()
                    .authenticated()
            )


            // =================================================
            // JWT RESOURCE SERVER
            // =================================================

            .oauth2ResourceServer(
                oauth2 ->
                    oauth2.jwt(jwt ->
                        jwt.jwtAuthenticationConverter(
                            jwtAuthenticationConverter
                        )
                    )
            );


        return http.build();
    }
}