package com.lilim.ecotracker.features.transport.repository;

import com.lilim.ecotracker.features.transport.model.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {

    List<Transport> findByUserId(Long userId);
}