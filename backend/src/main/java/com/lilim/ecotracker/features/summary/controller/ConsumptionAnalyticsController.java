package com.lilim.ecotracker.features.summary.controller;

import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for consumption analytics endpoints
 * Provides access to advanced analytics for the dashboard
 */
@RestController
@RequestMapping("/api/analytics")
public class ConsumptionAnalyticsController {

    private final ConsumptionAnalyticsService analyticsService;
    private final UserService userService;

    @Autowired
    public ConsumptionAnalyticsController(
            ConsumptionAnalyticsService analyticsService,
            UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    /**
     * Get water consumption analytics
     * @return Water consumption analytics DTO
     */
    @GetMapping("/water")
    public ResponseEntity<ConsumptionAnalyticsDTO> getWaterAnalytics() {
        ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(userService.getCurrentUser());
        return ResponseEntity.ok(analytics);
    }

    /**
     * Get electricity consumption analytics
     * @return Electricity consumption analytics DTO
     */
    @GetMapping("/electricity")
    public ResponseEntity<ConsumptionAnalyticsDTO> getElectricityAnalytics() {
        ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(userService.getCurrentUser());
        return ResponseEntity.ok(analytics);
    }

    /**
     * Get transport usage analytics
     * @return Transport usage analytics DTO
     */
    @GetMapping("/transport")
    public ResponseEntity<ConsumptionAnalyticsDTO> getTransportAnalytics() {
        ConsumptionAnalyticsDTO analytics = analyticsService.getTransportAnalytics(userService.getCurrentUser());
        return ResponseEntity.ok(analytics);
    }
}