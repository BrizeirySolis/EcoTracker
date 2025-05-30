package com.lilim.ecotracker.security.controller;

import com.lilim.ecotracker.security.dto.JwtResponse;
import com.lilim.ecotracker.security.dto.LoginRequest;
import com.lilim.ecotracker.security.dto.MessageResponse;
import com.lilim.ecotracker.security.dto.SignupRequest;
import com.lilim.ecotracker.security.jwt.JwtUtils;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.repository.UserRepository;
import com.lilim.ecotracker.security.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, 
                         UserRepository userRepository, 
                         PasswordEncoder encoder, 
                         JwtUtils jwtUtils,
                         UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            Set<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toSet());

            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Asegúrate de que el token no sea null y lo estés pasando correctamente
            System.out.println("Token generado: " + jwt.substring(0, 20) + "...");

            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roles));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El nombre de usuario ya está en uso"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El email ya está en uso"));
        }

        // Crear nueva cuenta de usuario
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setName(signUpRequest.getName());

        Set<String> roles = signUpRequest.getRoles();
        if (roles == null) {
            roles = new HashSet<>();
        }

        if (roles.isEmpty()) {
            roles.add("ROLE_USER");
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente"));
    }

    /**
     * Obtener la puntuación actual del usuario
     */
    @GetMapping("/user/score")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUserScore() {
        try {
            Integer puntuacion = userService.getCurrentUserScore();
            return ResponseEntity.ok(Map.of(
                    "puntuacion", puntuacion,
                    "message", "Puntuación obtenida exitosamente"
            ));
        } catch (Exception e) {
            logger.error("Error al obtener puntuación del usuario: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error al obtener la puntuación del usuario"));
        }
    }
}