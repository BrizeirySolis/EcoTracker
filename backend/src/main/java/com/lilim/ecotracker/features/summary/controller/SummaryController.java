package com.lilim.ecotracker.features.summary.controller;

import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.summary.dto.ConsumptionSummaryDTO;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final ElectricityRepository electricityRepository;
    private final WaterRepository waterRepository;
    private final TransportRepository transportRepository;
    private final UserService userService;

    @Autowired
    public SummaryController(
            ElectricityRepository electricityRepository,
            WaterRepository waterRepository,
            TransportRepository transportRepository,
            UserService userService) {
        this.electricityRepository = electricityRepository;
        this.waterRepository = waterRepository;
        this.transportRepository = transportRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<ConsumptionSummaryDTO>> getSummary() {
        Long userId = userService.getCurrentUser().getId();

        // Calcular la suma de cada tipo de consumo para el usuario actual
        double electricityTotal = electricityRepository.findByUserId(userId).stream()
                .mapToDouble(e -> e.getKilowatts())
                .sum();

        double waterTotal = waterRepository.findByUserId(userId).stream()
                .mapToDouble(w -> w.getLiters())
                .sum();

        double transportTotal = transportRepository.findByUserId(userId).stream()
                .mapToDouble(t -> t.getKilometers())
                .sum();

        // Calcular el total general
        double total = electricityTotal + waterTotal + transportTotal;

        List<ConsumptionSummaryDTO> summary = new ArrayList<>();

        // Si no hay datos, devolver datos de ejemplo
        if (total == 0) {
            summary.add(new ConsumptionSummaryDTO("Elemento 1", 100, 20));
            summary.add(new ConsumptionSummaryDTO("Elemento 2", 100, 20));
            summary.add(new ConsumptionSummaryDTO("Elemento 3", 100, 20));
            summary.add(new ConsumptionSummaryDTO("Elemento 4", 100, 20));
            summary.add(new ConsumptionSummaryDTO("Elemento 5", 100, 20));
        } else {
            // Añadir datos reales
            if (electricityTotal > 0) {
                int percentage = (int) Math.round((electricityTotal / total) * 100);
                summary.add(new ConsumptionSummaryDTO("Electricidad", electricityTotal, percentage));
            }

            if (waterTotal > 0) {
                int percentage = (int) Math.round((waterTotal / total) * 100);
                summary.add(new ConsumptionSummaryDTO("Agua", waterTotal, percentage));
            }

            if (transportTotal > 0) {
                int percentage = (int) Math.round((transportTotal / total) * 100);
                summary.add(new ConsumptionSummaryDTO("Transporte", transportTotal, percentage));
            }
        }

        return new ResponseEntity<>(summary, HttpStatus.OK);
    }
}