package com.bluecart.bluecart_backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.model.User;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    private final JwtDecoder jwtDecoder;

    private final long expiration;


    public JwtService(
            JwtEncoder jwtEncoder,
            JwtDecoder jwtDecoder,
            @Value("${jwt.expiration}") long expiration) {

        this.jwtEncoder = jwtEncoder;

        this.jwtDecoder = jwtDecoder;

        this.expiration = expiration;
    }


    // =====================================================
    // CUSTOMER TOKEN
    // =====================================================

    public String generateToken(
            User user) {

        Instant now =
                Instant.now();


        JwtClaimsSet claims =
                JwtClaimsSet.builder()

                        .subject(
                                user.getId()
                        )

                        .claim(
                                "email",
                                user.getEmail()
                        )

                        .claim(
                                "name",
                                user.getName()
                        )

                        .claim(
                                "role",
                                "CUSTOMER"
                        )

                        .issuedAt(
                                now
                        )

                        .expiresAt(
                                now.plus(
                                        expiration,
                                        ChronoUnit.MILLIS
                                )
                        )

                        .build();


        JwsHeader jwsHeader =
                JwsHeader
                        .with(
                                MacAlgorithm.HS256
                        )
                        .build();


        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                jwsHeader,
                                claims
                        )
                )
                .getTokenValue();
    }


    // =====================================================
    // ADMIN TOKEN
    // =====================================================

    public String generateAdminToken(
            String adminId,
            String email,
            String name) {

        Instant now =
                Instant.now();


        JwtClaimsSet claims =
                JwtClaimsSet.builder()

                        .subject(
                                adminId
                        )

                        .claim(
                                "email",
                                email
                        )

                        .claim(
                                "name",
                                name
                        )

                        .claim(
                                "role",
                                "ADMIN"
                        )

                        .issuedAt(
                                now
                        )

                        .expiresAt(
                                now.plus(
                                        expiration,
                                        ChronoUnit.MILLIS
                                )
                        )

                        .build();


        JwsHeader jwsHeader =
                JwsHeader
                        .with(
                                MacAlgorithm.HS256
                        )
                        .build();


        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                jwsHeader,
                                claims
                        )
                )
                .getTokenValue();
    }


    // =====================================================
    // GET USER ID FROM TOKEN
    // =====================================================

    public String getUserIdFromToken(
            String token) {

        return jwtDecoder
                .decode(
                        token
                )
                .getSubject();
    }
}