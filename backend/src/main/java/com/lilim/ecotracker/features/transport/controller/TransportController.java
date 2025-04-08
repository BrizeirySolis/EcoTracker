package com.lilim.ecotracker.features.transport.controller;

import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;

    @Autowired
    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @PostMapping
    public ResponseEntity<Transport> saveUsage(@RequestBody Transport transport) {
        Transport savedUsage = transportService.saveUsage(transport);
        return new ResponseEntity<>(savedUsage, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Transport>> getAllUsage() {
        List<Transport> usages = transportService.getAllUsage();
        return new ResponseEntity<>(usages, HttpStatus.OK);
    }
}