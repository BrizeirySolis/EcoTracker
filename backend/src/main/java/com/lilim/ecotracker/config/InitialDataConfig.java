package com.lilim.ecotracker.config;

import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class InitialDataConfig {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public InitialDataConfig(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            // Verificar si ya existe el usuario admin
            if (!userRepository.existsByUsername("admin")) {
                // Crear usuario admin
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@ecotracker.com");
                adminUser.setPassword(passwordEncoder.encode("pass")); // Cifra la contraseña
                adminUser.setName("Administrador");
                adminUser.setCreatedAt(LocalDateTime.now());
                
                Set<String> roles = new HashSet<>();
                roles.add("ROLE_ADMIN");
                adminUser.setRoles(roles);
                
                userRepository.save(adminUser);
                
                System.out.println("Usuario administrador creado con éxito.");
            } else {
                System.out.println("El usuario administrador ya existe.");
            }
        };
    }
}