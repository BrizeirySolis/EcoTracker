package com.lilim.ecotracker.features.electricity.service;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElectricityServiceImpl implements ElectricityService {

    private final ElectricityRepository electricityRepository;
    private final UserService userService;

    @Autowired
    public ElectricityServiceImpl(ElectricityRepository electricityRepository, UserService userService) {
        this.electricityRepository = electricityRepository;
        this.userService = userService;
    }

    @Override
    public Electricity saveConsumption(Electricity electricity) {
        electricity.setUser(userService.getCurrentUser());
        return electricityRepository.save(electricity);
    }

    @Override
    public List<Electricity> getAllConsumption() {
        return electricityRepository.findByUserId(userService.getCurrentUser().getId());
    }
}