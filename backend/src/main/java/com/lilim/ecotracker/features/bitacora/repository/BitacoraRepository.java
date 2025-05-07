package com.lilim.ecotracker.features.bitacora.repository;

import com.lilim.ecotracker.features.bitacora.model.Bitacora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Bitacora entity operations
 * Provides methods for CRUD operations and custom queries
 */
@Repository
public interface BitacoraRepository extends JpaRepository<Bitacora, Long> {
    
    /**
     * Find all bitácoras for a specific user
     * @param userId The user's ID
     * @return List of bitácoras belonging to the user
     */
    List<Bitacora> findByUserId(Long userId);
    
    /**
     * Find all bitácoras for a specific user ordered by date (newest first)
     * @param userId The user's ID
     * @return Ordered list of bitácoras
     */
    List<Bitacora> findByUserIdOrderByFechaDesc(Long userId);
    
    /**
     * Find a specific bitácora for a user
     * Ensures users can only access their own bitácoras
     * @param id The bitácora ID
     * @param userId The user's ID
     * @return Optional containing the bitácora if found
     */
    Optional<Bitacora> findByIdAndUserId(Long id, Long userId);
    
    /**
     * Find all bitácoras for a user filtered by category
     * @param userId The user's ID
     * @param categoria The category to filter by
     * @return List of filtered bitácoras
     */
    List<Bitacora> findByUserIdAndCategoriaOrderByFechaDesc(Long userId, String categoria);
    
    /**
     * Check if a bitácora belongs to a specific user
     * Used for authorization checks
     * @param id The bitácora ID
     * @param userId The user's ID
     * @return true if the bitácora belongs to the user
     */
    boolean existsByIdAndUserId(Long id, Long userId);
}