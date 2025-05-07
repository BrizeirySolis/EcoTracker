package com.lilim.ecotracker.features.water.repository;

import com.lilim.ecotracker.features.water.model.Water;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaterRepository extends JpaRepository<Water, Long> {

    List<Water> findByUserId(Long userId);
}