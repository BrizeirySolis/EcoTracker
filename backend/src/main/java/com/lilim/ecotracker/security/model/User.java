package com.lilim.ecotracker.security.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Modelo de usuario del sistema de autenticación y autorización
 * Incluye información básica del usuario y sistema de puntuación por metas completadas
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    /**
     * Puntuación acumulada del usuario por completar metas
     * Se otorgan +10 puntos por cada meta completada exitosamente
     */
    @Column(nullable = false)
    private Integer puntuacion = 0;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (roles.isEmpty()) {
            roles.add("ROLE_USER");
        }
        if (puntuacion == null) {
            puntuacion = 0;
        }
    }
}
