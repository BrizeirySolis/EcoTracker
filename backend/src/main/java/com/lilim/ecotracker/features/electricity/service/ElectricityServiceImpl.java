package com.lilim.ecotracker.features.electricity.service;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.metas.service.MetaService;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// En backend/src/main/java/com/lilim/ecotracker/features/electricity/service/ElectricityServiceImpl.java

@Service
public class ElectricityServiceImpl implements ElectricityService {

    private final ElectricityRepository electricityRepository;
    private final UserService userService;
    private final MetaService metaService;

    @Autowired
    public ElectricityServiceImpl(
            ElectricityRepository electricityRepository,
            UserService userService,
            MetaService metaService) {
        this.electricityRepository = electricityRepository;
        this.userService = userService;
        this.metaService = metaService;
    }

    @Override
    public Electricity saveConsumption(Electricity electricity) {
        electricity.setUser(userService.getCurrentUser());
        Electricity savedElectricity = electricityRepository.save(electricity);

        // Actualizar automáticamente las metas de electricidad
        try {
            metaService.updateAutomaticMetasForType("electricidad");
            System.out.println("Metas de electricidad actualizadas automáticamente tras nuevo registro");
        } catch (Exception e) {
            System.err.println("Error al actualizar metas de electricidad: " + e.getMessage());
            e.printStackTrace();
        }

        return savedElectricity;
    }

    @Override
    public List<Electricity> getAllConsumption() {
        return electricityRepository.findByUserId(userService.getCurrentUser().getId());
    }
}