package com.realestate.backend.Security;

import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

    private final String SECRET_KEY =
            "mySecretKeyForRealEstateDueDiligenceProject2026";

    public String generateToken(String email,String role) {

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String extractEmail(String token) {

        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getPayload();

        return claims.getSubject();
    }
    public String extractRole(String token) {

        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getPayload();

        return claims.get("role", String.class);
    }

    public boolean isTokenValid(String token) {

        try {
            extractEmail(token);
            return true;

        } catch (Exception e) {
            return false;
        }
    }
}