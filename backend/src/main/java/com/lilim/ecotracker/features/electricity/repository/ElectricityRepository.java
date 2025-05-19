package com.lilim.ecotracker.features.electricity.repository;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ElectricityRepository extends JpaRepository<Electricity, Long> {
    List<Electricity> findByUserId(Long electricityId);
    List<Electricity> findByUserIdAndDateBetween(Long userId, LocalDateTime dateStart, LocalDateTime dateEnd);
}