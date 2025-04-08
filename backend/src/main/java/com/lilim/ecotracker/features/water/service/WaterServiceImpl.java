package com.lilim.ecotracker.features.water.service;

import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.features.water.model.Water;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WaterServiceImpl implements WaterService {

    private final WaterRepository waterRepository;

    @Autowired
    public WaterServiceImpl(WaterRepository waterRepository) {
        this.waterRepository = waterRepository;
    }

    @Override
    public Water saveConsumption(Water water) {
        return waterRepository.save(water);
    }

    @Override
    public List<Water> getAllConsumption() {
        return waterRepository.findAll();
    }
}