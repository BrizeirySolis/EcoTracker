package com.lilim.ecotracker.features.transport.repository;

import com.lilim.ecotracker.features.transport.model.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    List<Transport> findByUserIdAndDateBefore(Long id, LocalDateTime fechaCreacionMeta);

    List<Transport> findByUserIdAndTransportTypeAndDateBefore(Long id, String car, LocalDateTime fechaCreacionMeta);

    // Para obtener el costo total en un rango de fechas
    @Query("SELECT SUM(t.cost) FROM Transport t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
    Double sumCostByUserIdAndDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Para obtener kilómetros por tipo de transporte en un rango de fechas
    @Query("SELECT SUM(t.kilometers) FROM Transport t WHERE t.user.id = :userId AND t.transportType = :transportType AND t.date BETWEEN :startDate AND :endDate")
    Double sumKilometersByUserIdAndTransportTypeAndDateBetween(@Param("userId") Long userId, @Param("transportType") String transportType, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Obtener registros después de una fecha específica
    List<Transport> findByUserIdAndDateAfter(Long userId, LocalDateTime date);

    // Sumatoria de costos por usuario y rango de fechas
    @Query("SELECT SUM(t.cost) FROM Transport t WHERE t.user.id = :userId AND t.date > :date")
    Double sumCostByUserIdAndDateAfter(@Param("userId") Long userId, @Param("date") LocalDateTime date);

    // Sumatoria de kilómetros por tipo de transporte y fecha
    @Query("SELECT SUM(t.kilometers) FROM Transport t WHERE t.user.id = :userId AND t.transportType = :type AND t.date > :date")
    Double sumKilometersByUserIdAndTypeAndDateAfter(@Param("userId") Long userId, @Param("type") String type, @Param("date") LocalDateTime date);
}