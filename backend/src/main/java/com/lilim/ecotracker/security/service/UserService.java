package com.lilim.ecotracker.security.service;

import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final int PUNTOS_POR_META_COMPLETADA = 10;
    
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("No se encontró el usuario actual"));
    }

    /**
     * Obtener la puntuación actual del usuario
     * @return puntuación del usuario actual
     */
    public Integer getCurrentUserScore() {
        User user = getCurrentUser();
        return user.getPuntuacion() != null ? user.getPuntuacion() : 0;
    }

    /**
     * Agregar puntos al usuario actual
     * @param puntos cantidad de puntos a agregar
     * @return nueva puntuación total
     */
    @Transactional
    public Integer addPointsToCurrentUser(int puntos) {
        User user = getCurrentUser();
        int nuevaPuntuacion = (user.getPuntuacion() != null ? user.getPuntuacion() : 0) + puntos;
        user.setPuntuacion(nuevaPuntuacion);
        userRepository.save(user);
        
        logger.info("Usuario {} recibió {} puntos. Nueva puntuación: {}", 
                user.getUsername(), puntos, nuevaPuntuacion);
        
        return nuevaPuntuacion;
    }

    /**
     * Otorgar puntos por completar una meta
     * @return nueva puntuación total
     */
    @Transactional
    public Integer awardPointsForCompletedGoal() {
        int nuevaPuntuacion = addPointsToCurrentUser(PUNTOS_POR_META_COMPLETADA);
        
        User user = getCurrentUser();
        logger.info("¡Meta completada! Usuario {} recibió {} puntos por completar una meta. Puntuación total: {}", 
                user.getUsername(), PUNTOS_POR_META_COMPLETADA, nuevaPuntuacion);
        
        return nuevaPuntuacion;
    }
}