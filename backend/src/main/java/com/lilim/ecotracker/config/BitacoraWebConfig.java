package com.lilim.ecotracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration for serving static resources like uploaded images
 */
@Configuration
public class BitacoraWebConfig implements WebMvcConfigurer {
    
    @Value("${ecotracker.bitacoras.image-upload-dir:uploads/bitacoras}")
    private String uploadDir;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the upload directory as static resources
        Path uploadPath = Paths.get(uploadDir);
        String absolutePath = uploadPath.toFile().getAbsolutePath();
        
        registry.addResourceHandler("/bitacoras-images/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}