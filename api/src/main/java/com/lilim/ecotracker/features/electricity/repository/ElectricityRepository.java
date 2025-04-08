package com.lilim.ecotracker.features.electricity.repository;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ElectricityRepository extends JpaRepository<Electricity, Long> {

}