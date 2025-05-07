package com.lilim.ecotracker.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class AuthTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = Logger.getLogger(AuthTokenFilter.class.getName());

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);

            // Log para depuración
            logger.info("Request path: " + request.getRequestURI());
            logger.info("Authorization header: " + request.getHeader("Authorization"));
            logger.info("JWT extraído: " + (jwt != null ? jwt.substring(0, Math.min(10, jwt.length())) + "..." : "null"));

            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.info("JWT válido para el usuario: " + username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Usuario autenticado correctamente: " + username);
            } else if (jwt != null) {
                logger.warning("JWT no válido o expirado");
            } else {
                logger.info("No se encontró JWT en la solicitud");
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Cannot set user authentication: " + e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        logger.info("Header Authorization raw: " + headerAuth);

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            logger.info("Token extraído del header: " + token.substring(0, Math.min(10, token.length())) + "...");
            return token;
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/h2-console");
    }

}