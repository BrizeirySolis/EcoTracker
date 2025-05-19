package com.lilim.ecotracker.features.metas.model;

import com.lilim.ecotracker.security.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidad que representa una meta ambiental del usuario
 * Almacena desafíos personales para mejorar hábitos con impacto ambiental
 */
@Entity
@Table(name = "metas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Meta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000)
    private String descripcion;

    /**
     * Tipo de meta (agua, electricidad, transporte, combinada, otro)
     */
    @Column(nullable = false)
    private String tipo;

    /**
     * Valor objetivo de la meta (ej: reducir a 12m³, aumentar a 40%, etc.)
     */
    @Column(nullable = false)
    private Double valorObjetivo;

    /**
     * Valor inicial desde el que se parte (para metas de reducción)
     * Por ejemplo, consumo actual antes de empezar la meta
     */
    @Column(nullable = true)
    private Double valorInicial;

    /**
     * Unidad de medida (m3, kwh, porcentaje, etc.)
     */
    @Column(nullable = false)
    private String unidad;

    /**
     * Métrica específica que se está midiendo
     * (ej: consumo_total, costo_unitario, promedio_movil, etc.)
     */
    @Column
    private String metrica;

    /**
     * Fecha de inicio del período de la meta
     */
    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    /**
     * Fecha de fin del período de la meta
     */
    @Column(nullable = false)
    private LocalDateTime fechaFin;

    /**
     * Estado actual de la meta (en_progreso, completada, fallida)
     */
    @Column(nullable = false)
    private String estado;

    /**
     * Valor actual del progreso hacia la meta
     */
    @Column(nullable = false)
    private Double valorActual;

    /**
     * Tipo de evaluación (automática o manual)
     * Automática: Se calcula a partir de los registros de consumo
     * Manual: El usuario actualiza el progreso directamente
     */
    @Column(nullable = false)
    private String tipoEvaluacion;

    /**
     * Usuario propietario de la meta
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Fecha de creación de la meta
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Fecha de última actualización
     */
    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (estado == null) {
            estado = "en_progreso";
        }
        if (valorActual == null) {
            valorActual = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}