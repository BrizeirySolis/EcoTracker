package com.lilim.ecotracker.features.water.controller;

import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.features.water.service.WaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water")
public class WaterController {

    private final WaterService waterService;

    @Autowired
    public WaterController(WaterService waterService) {
        this.waterService = waterService;
    }

    @PostMapping
    public ResponseEntity<Water> saveConsumption(@RequestBody Water water) {
        Water savedConsumption = waterService.saveConsumption(water);
        return new ResponseEntity<>(savedConsumption, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Water>> getAllConsumption() {
        List<Water> consumptions = waterService.getAllConsumption();
        return new ResponseEntity<>(consumptions, HttpStatus.OK);
    }
}