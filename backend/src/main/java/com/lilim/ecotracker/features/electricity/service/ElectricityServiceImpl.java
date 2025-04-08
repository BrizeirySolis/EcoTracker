package com.lilim.ecotracker.features.electricity.service;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElectricityServiceImpl implements ElectricityService {

    private final ElectricityRepository electricityRepository;

    @Autowired
    public ElectricityServiceImpl(ElectricityRepository electricityRepository) {
        this.electricityRepository = electricityRepository;
    }

    @Override
    public Electricity saveConsumption(Electricity electricity) {
        return electricityRepository.save(electricity);
    }

    @Override
    public List<Electricity> getAllConsumption() {
        return electricityRepository.findAll();
    }
}
