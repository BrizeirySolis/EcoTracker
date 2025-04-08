package com.lilim.ecotracker.features.electricity.model;

import com.lilim.ecotracker.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "electricity_consumption")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Electricity extends BaseEntity {
    
    @Column(nullable = false)
    private Double kilowatts;
}