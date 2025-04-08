package com.lilim.ecotracker.features.water.service;

import com.lilim.ecotracker.features.water.model.Water;
import java.util.List;

public interface WaterService {
    Water saveConsumption(Water water);
    List<Water> getAllConsumption();
}