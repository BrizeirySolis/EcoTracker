package com.lilim.ecotracker.features.transport.model;

import com.lilim.ecotracker.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "transport_usage")
@Getter
@Setter
public class Transport extends BaseEntity {
    
    @Column(nullable = false)
    private Double kilometers;
    
    @Column(nullable = false)
    private String transportType;
}