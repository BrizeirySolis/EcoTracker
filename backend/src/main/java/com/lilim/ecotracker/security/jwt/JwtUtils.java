package com.lilim.ecotracker.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class JwtUtils {
    private static final Logger logger = Logger.getLogger(JwtUtils.class.getName());

    // Generamos una clave segura para HS256 al iniciar la aplicación
    private final SecretKey jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    @Value("${ecotracker.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        logger.info("Generando token JWT para el usuario: " + userPrincipal.getUsername());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        logger.info("Token válido desde: " + now + " hasta: " + expiryDate);

        String token = Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecret)  // Usa la clave generada
                .compact();

        logger.info("Token generado: " + token.substring(0, 20) + "...");

        return token;
    }

    public String getUserNameFromJwtToken(String token) {
        try {
            String username = Jwts.parserBuilder()
                    .setSigningKey(jwtSecret)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

            logger.info("Username extraído del token: " + username);
            return username;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error al extraer username del token: " + e.getMessage(), e);
            throw e;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtSecret)
                    .build()
                    .parseClaimsJws(authToken);

            logger.info("Token JWT válido");
            return true;
        } catch (SignatureException e) {
            logger.severe("Firma JWT inválida: " + e.getMessage());
        } catch (MalformedJwtException e) {
            logger.severe("Token JWT malformado: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.severe("Token JWT expirado: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.severe("Token JWT no soportado: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.severe("JWT claims string está vacío: " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Error general validando JWT: " + e.getMessage());
        }

        return false;
    }
}