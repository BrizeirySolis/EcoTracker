package com.lilim.ecotracker.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AngularRoutesController {
    @GetMapping({
            "/",
            "/home",
            "/login",
            "/register",
            "/habitos",
            "/luz",
            "/agua",
            "/transporte",
            "/profile",
            "/bitacoras",
            "/bitacoras/**",
    })
    public String forwardToAngularIndex() {
        return "forward:/index.html";  // Apunta directamente a index.html en la raíz de static
    }
}