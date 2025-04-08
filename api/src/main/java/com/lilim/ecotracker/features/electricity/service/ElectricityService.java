package com.lilim.ecotracker.features.electricity.service;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import java.util.List;

public interface ElectricityService {
    Electricity saveConsumption(Electricity electricity);
    List<Electricity> getAllConsumption();
}