package com.lilim.ecotracker.features.water.model;

import com.lilim.ecotracker.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "water_consumption")
@Getter
@Setter
public class Water extends BaseEntity {
    
    @Column(nullable = false)
    private Double liters;
}