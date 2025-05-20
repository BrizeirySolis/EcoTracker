package com.lilim.ecotracker.features.water.service;

import com.lilim.ecotracker.features.metas.service.MetaService;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// En backend/src/main/java/com/lilim/ecotracker/features/water/service/WaterServiceImpl.java

@Service
public class WaterServiceImpl implements WaterService {

    private final WaterRepository waterRepository;
    private final UserService userService;
    private final MetaService metaService; // Añadir esta referencia

    @Autowired
    public WaterServiceImpl(
            WaterRepository waterRepository,
            UserService userService,
            MetaService metaService) { // Añadir parámetro
        this.waterRepository = waterRepository;
        this.userService = userService;
        this.metaService = metaService; // Inicializar
    }

    @Override
    public Water saveConsumption(Water water) {
        water.setUser(userService.getCurrentUser());
        Water savedWater = waterRepository.save(water);

        // Actualizar automáticamente las metas de agua
        try {
            metaService.updateAutomaticMetasForType("agua");
            System.out.println("Metas de agua actualizadas automáticamente tras nuevo registro");
        } catch (Exception e) {
            System.err.println("Error al actualizar metas de agua: " + e.getMessage());
            e.printStackTrace();
        }

        return savedWater;
    }

    @Override
    public List<Water> getAllConsumption() {
        return waterRepository.findByUserId(userService.getCurrentUser().getId());
    }
}