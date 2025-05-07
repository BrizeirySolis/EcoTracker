package com.lilim.ecotracker.config;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Random;

/**
 * Service to generate realistic test data for the application
 * This service creates consumption data for demo and testing purposes
 */
@Service
public class TestDataGeneratorService {

    private final UserRepository userRepository;
    private final WaterRepository waterRepository;
    private final ElectricityRepository electricityRepository;
    private final TransportRepository transportRepository;
    private final Random random = new Random();

    @Autowired
    public TestDataGeneratorService(
            UserRepository userRepository,
            WaterRepository waterRepository,
            ElectricityRepository electricityRepository,
            TransportRepository transportRepository) {
        this.userRepository = userRepository;
        this.waterRepository = waterRepository;
        this.electricityRepository = electricityRepository;
        this.transportRepository = transportRepository;
    }

    /**
     * Generates realistic consumption data for the admin user
     * Creates water, electricity and transport consumption records
     */
    public void generateDataForAdmin() {
        User adminUser = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // Generate data for the last 12 months (bimonthly)
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 11; i >= 0; i--) {
            LocalDateTime date = now.minus(i * 2, ChronoUnit.MONTHS);
            
            // Water consumption - Realistic values
            generateWaterConsumption(adminUser, date, i);
            
            // Electricity consumption
            generateElectricityConsumption(adminUser, date, i);
            
            // Transport usage
            generateTransportUsage(adminUser, date, i);
        }
    }

    /**
     * Generates realistic water consumption data
     * Average household in Mexico uses ~14.4 m³ per bimonthly period
     */
    private void generateWaterConsumption(User user, LocalDateTime date, int periodIndex) {
        // Base consumption with seasonal variation (more in summer)
        double seasonalFactor = getSeasonalFactor(date.getMonthValue(), 0.3);
        
        // Base volume around 14 m³ with some randomness and optional anomaly
        double volume = 14.0 * seasonalFactor * (0.9 + random.nextDouble() * 0.4);
        
        // Introduce occasional anomalies (high consumption)
        if (random.nextDouble() < 0.2) {
            volume *= 1.3 + random.nextDouble() * 0.5; // 30-80% higher
        }
        
        // Cost is around 23 pesos per m³ with some variation over time
        // Later periods have slightly higher unit costs to simulate inflation
        double unitCost = 23.0 * (1 + 0.01 * (12 - periodIndex));
        double cost = volume * unitCost;

        Water water = new Water();
        water.setUser(user);
        water.setDate(date);
        water.setLiters(volume);
        water.setCost(cost);
        water.setCreatedAt(date);

        waterRepository.save(water);
    }

    /**
     * Generates realistic electricity consumption data
     * Average household in Mexico uses ~250 kWh per bimonthly period
     */
    private void generateElectricityConsumption(User user, LocalDateTime date, int periodIndex) {
        // Base consumption with seasonal variation (more in summer for AC)
        double seasonalFactor = getSeasonalFactor(date.getMonthValue(), 0.5);
        
        // Base value around 250 kWh with some randomness
        double kWh = 250.0 * seasonalFactor * (0.9 + random.nextDouble() * 0.3);
        
        // Introduce occasional anomalies
        if (random.nextDouble() < 0.2) {
            kWh *= 1.2 + random.nextDouble() * 0.4; // 20-60% higher
        }
        
        // Cost is around 1.8 pesos per kWh with some variation over time
        double unitCost = 1.8 * (1 + 0.015 * (12 - periodIndex));
        double cost = kWh * unitCost;

        Electricity electricity = new Electricity();
        electricity.setUser(user);
        electricity.setDate(date);
        electricity.setKilowatts(kWh);
        electricity.setCost(cost);
        electricity.setCreatedAt(date);

        electricityRepository.save(electricity);
    }

    /**
     * Generates realistic transport usage data
     * Assuming average commute distance of ~300 km per bimonthly period
     */
    private void generateTransportUsage(User user, LocalDateTime date, int periodIndex) {
        // Introduce some seasonal variation (less in rainy season)
        double seasonalFactor = 1.0 - 0.1 * (date.getMonthValue() >= 6 && date.getMonthValue() <= 9 ? 1 : 0);
        
        // Base value around 300 km with some randomness
        double km = 300.0 * seasonalFactor * (0.85 + random.nextDouble() * 0.3);
        
        // Transport types with weighted probabilities
        String[] transportTypes = {"car", "bus", "bicycle", "walk", "other"};
        int typeIndex = getWeightedRandom(new double[]{0.6, 0.3, 0.05, 0.03, 0.02});
        String transportType = transportTypes[typeIndex];
        
        // Cost depends on transport type
        double unitCost;
        switch (transportType) {
            case "car":
                unitCost = 4.0 * (1 + 0.02 * (12 - periodIndex)); // Gas price inflation
                break;
            case "bus":
                unitCost = 0.5 * (1 + 0.01 * (12 - periodIndex));
                break;
            case "bicycle":
            case "walk":
                unitCost = 0.0;
                break;
            default:
                unitCost = 2.0 * (1 + 0.01 * (12 - periodIndex));
        }
        double cost = km * unitCost;

        Transport transport = new Transport();
        transport.setUser(user);
        transport.setDate(date);
        transport.setKilometers(km);
        transport.setTransportType(transportType);
        transport.setCost(cost);
        transport.setCreatedAt(date);

        transportRepository.save(transport);
    }
    
    /**
     * Calculates a seasonal factor based on month for realistic consumption pattern
     * @param month Calendar month (1-12)
     * @param amplitude Maximum variation from baseline (0-1)
     * @return Seasonal multiplier
     */
    private double getSeasonalFactor(int month, double amplitude) {
        // Sinusoidal pattern with peak in summer (month 7-8)
        // For northern hemisphere seasonal pattern
        double phase = 2 * Math.PI * ((month - 1) / 12.0);
        return 1.0 + amplitude * Math.sin(phase + Math.PI/6);  // Shifted to peak in July/August
    }
    
    /**
     * Returns a weighted random index based on provided probabilities
     * @param weights Array of weights/probabilities (should sum to ~1.0)
     * @return Selected index
     */
    private int getWeightedRandom(double[] weights) {
        double totalWeight = 0.0;
        for (double weight : weights) {
            totalWeight += weight;
        }
        
        double randomValue = random.nextDouble() * totalWeight;
        double cumulativeWeight = 0.0;
        
        for (int i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (randomValue <= cumulativeWeight) {
                return i;
            }
        }
        
        return weights.length - 1; // Fallback
    }
}