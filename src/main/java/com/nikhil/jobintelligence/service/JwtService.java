package com.nikhil.jobintelligence.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
@Service
public class JwtService {

	private final SecretKey secretKey;

	public JwtService(@Value("${security.jwt.secret}") String secret) {
	    if (secret == null ||
	            secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
	        throw new IllegalArgumentException(
	                "JWT secret must be at least 32 bytes long"
	        );
	    }

	    this.secretKey = Keys.hmacShaKeyFor(
	            secret.getBytes(java.nio.charset.StandardCharsets.UTF_8)
	    );
	}

    public String generateToken(UserDetails userDetails) {

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60)
                )
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}