package com.lilim.ecotracker.features.transport.service;

import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportServiceImpl implements TransportService {

    private final TransportRepository transportRepository;

    @Autowired
    public TransportServiceImpl(TransportRepository transportRepository) {
        this.transportRepository = transportRepository;
    }

    @Override
    public Transport saveUsage(Transport transport) {
        return transportRepository.save(transport);
    }

    @Override
    public List<Transport> getAllUsage() {
        return transportRepository.findAll();
    }
}