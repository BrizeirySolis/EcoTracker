package com.lilim.ecotracker.features.electricity.controller;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.service.ElectricityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/electricity")
public class ElectricityController {

    private final ElectricityService electricityService;

    @Autowired
    public ElectricityController(ElectricityService electricityService) {
        this.electricityService = electricityService;
    }

    @PostMapping
    public ResponseEntity<Electricity> saveConsumption(@RequestBody Electricity electricity) {
        Electricity savedConsumption = electricityService.saveConsumption(electricity);
        return new ResponseEntity<>(savedConsumption, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Electricity>> getAllConsumption() {
        List<Electricity> consumptions = electricityService.getAllConsumption();
        return new ResponseEntity<>(consumptions, HttpStatus.OK);
    }
}
