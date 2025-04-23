package com.lilim.ecotracker.features.transport.service;

import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportServiceImpl implements TransportService {

    private final TransportRepository transportRepository;
    private final UserService userService;

    @Autowired
    public TransportServiceImpl(TransportRepository transportRepository, UserService userService) {
        this.transportRepository = transportRepository;
        this.userService = userService;
    }

    @Override
    public Transport saveUsage(Transport transport) {
        transport.setUser(userService.getCurrentUser());
        return transportRepository.save(transport);
    }

    @Override
    public List<Transport> getAllUsage() {
        return transportRepository.findByUserId(userService.getCurrentUser().getId());
    }
}
