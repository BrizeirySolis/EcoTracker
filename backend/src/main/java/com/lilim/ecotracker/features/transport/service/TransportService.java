package com.lilim.ecotracker.features.transport.service;

import com.lilim.ecotracker.features.transport.model.Transport;
import java.util.List;

public interface TransportService {
    Transport saveUsage(Transport transport);
    List<Transport> getAllUsage();
}