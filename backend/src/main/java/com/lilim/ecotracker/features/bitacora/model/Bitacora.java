package com.lilim.ecotracker.features.bitacora.model;

import com.lilim.ecotracker.security.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing an environmental activity log (Bitácora)
 * Stores user activities with positive environmental impact
 */
@Entity
@Table(name = "bitacoras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bitacora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000)
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column
    private String imagenUrl;

    @Column(nullable = false)
    private String categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Dynamic fields stored as JSON for category-specific attributes
     * Will store additional fields based on the selected category
     */
    @Column(columnDefinition = "TEXT")
    private String camposAdicionales;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (fecha == null) {
            fecha = createdAt;
        }
    }
}