package com.lilim.ecotracker.features.water.repository;

import com.lilim.ecotracker.features.water.model.Water;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaterRepository extends JpaRepository<Water, Long> {
}