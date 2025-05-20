package com.lilim.ecotracker.features.transport.service;

import com.lilim.ecotracker.features.metas.service.MetaService;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// En backend/src/main/java/com/lilim/ecotracker/features/transport/service/TransportServiceImpl.java

@Service
public class TransportServiceImpl implements TransportService {

    private final TransportRepository transportRepository;
    private final UserService userService;
    private final MetaService metaService; // Añadir esta referencia

    @Autowired
    public TransportServiceImpl(
            TransportRepository transportRepository,
            UserService userService,
            MetaService metaService) { // Añadir parámetro
        this.transportRepository = transportRepository;
        this.userService = userService;
        this.metaService = metaService; // Inicializar
    }

    @Override
    public Transport saveUsage(Transport transport) {
        transport.setUser(userService.getCurrentUser());
        Transport savedTransport = transportRepository.save(transport);

        // Actualizar automáticamente las metas de transporte
        try {
            metaService.updateAutomaticMetasForType("transporte");
            System.out.println("Metas de transporte actualizadas automáticamente tras nuevo registro");
        } catch (Exception e) {
            System.err.println("Error al actualizar metas de transporte: " + e.getMessage());
            e.printStackTrace();
        }

        return savedTransport;
    }

    @Override
    public List<Transport> getAllUsage() {
        return transportRepository.findByUserId(userService.getCurrentUser().getId());
    }
}
