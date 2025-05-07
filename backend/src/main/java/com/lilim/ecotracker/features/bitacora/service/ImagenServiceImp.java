package com.lilim.ecotracker.features.bitacora.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Service for handling image operations for bitácoras
 * Manages storing, retrieving, and deleting images
 */
@Service
public class ImagenServiceImp {
    
    @Value("${ecotracker.bitacoras.image-upload-dir:uploads/bitacoras}")
    private String uploadDir;
    
    /**
     * Store an image file and return its relative path
     * @param file The uploaded image file
     * @return Path to the stored image
     * @throws IOException If file operations fail
     */
    public String storeImage(MultipartFile file) throws IOException {
        // Ensure directory exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String filename = UUID.randomUUID().toString() + 
                getFileExtension(file.getOriginalFilename());
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        // Return relative path
        return filename;
    }
    
    /**
     * Delete an image from storage
     * @param imagePath Relative path to the image
     * @return true if deletion was successful
     */
    public boolean deleteImage(String imagePath) {
        try {
            Path file = Paths.get(uploadDir).resolve(imagePath);
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * Extract file extension from filename
     * @param filename Original filename
     * @return File extension with dot (e.g., ".jpg")
     */
    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return filename.substring(lastIndexOf);
    }
}