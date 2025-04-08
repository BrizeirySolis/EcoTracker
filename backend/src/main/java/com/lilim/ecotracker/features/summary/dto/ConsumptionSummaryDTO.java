package com.lilim.ecotracker.features.summary.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsumptionSummaryDTO {
    private String label;
    private double value;
    private int percentage;
}