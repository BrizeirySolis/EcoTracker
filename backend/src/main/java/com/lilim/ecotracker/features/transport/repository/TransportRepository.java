package com.lilim.ecotracker.features.transport.repository;

import com.lilim.ecotracker.features.transport.model.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {

    List<Transport> findByUserId(Long userId);
    List<Transport> findByUserIdAndDateBetween(Long userId, LocalDateTime dateStart, LocalDateTime dateEnd);
    List<Transport> findByUserIdAndDateBetweenAndTransportType(Long userId, LocalDateTime dateStart, LocalDateTime dateEnd, String transportType);

    List<Transport> findByUserIdOrderByDateDesc(Long id);

    List<Transport> findByUserIdAndTransportType(Long id, String car);

    List<Transport> findByUserIdAndTransportTypeAndDateBetween(Long id, String bicycle, LocalDateTime unMesAtras, LocalDateTime now);
}