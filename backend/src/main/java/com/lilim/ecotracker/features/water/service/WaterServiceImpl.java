package com.lilim.ecotracker.features.water.service;

import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WaterServiceImpl implements WaterService {

    private final WaterRepository waterRepository;
    private final UserService userService;

    @Autowired
    public WaterServiceImpl(WaterRepository waterRepository, UserService userService) {
        this.waterRepository = waterRepository;
        this.userService = userService;
    }

    @Override
    public Water saveConsumption(Water water) {
        water.setUser(userService.getCurrentUser());
        return waterRepository.save(water);
    }

    @Override
    public List<Water> getAllConsumption() {
        return waterRepository.findByUserId(userService.getCurrentUser().getId());
    }
}
