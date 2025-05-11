package com.lilim.ecotracker.features.bitacora.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * Service for handling image operations for bitácoras
 * Manages storing, retrieving, and deleting images
 * Includes image optimization to reduce storage requirements
 */
@Service
public class ImagenServiceImp {

    private static final Logger logger = Logger.getLogger(ImagenServiceImp.class.getName());

    // Maximum image size in bytes (1MB)
    private static final long MAX_IMAGE_SIZE = 1024 * 1024;

    // Maximum dimensions for optimization
    private static final int MAX_WIDTH = 1920;
    private static final int MAX_HEIGHT = 1080;

    // Quality reduction steps
    private static final float[] QUALITY_STEPS = {0.9f, 0.8f, 0.7f, 0.6f, 0.5f};

    @Value("${ecotracker.bitacoras.image-upload-dir:uploads/bitacoras}")
    private String uploadDir;

    /**
     * Store an image file and return its relative path
     * Applies optimization if the image is larger than MAX_IMAGE_SIZE
     *
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
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + extension;

        // Check if optimization is needed
        byte[] optimizedImageData;
        if (file.getSize() > MAX_IMAGE_SIZE) {
            logger.info("Image size (" + file.getSize() + " bytes) exceeds limit. Optimizing...");
            optimizedImageData = optimizeImage(file.getBytes(), extension);
        } else {
            logger.info("Image size is within limits. Storing original.");
            optimizedImageData = file.getBytes();
        }

        // Save file
        Path filePath = uploadPath.resolve(filename);
        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(optimizedImageData);
            logger.info("Image saved successfully to: " + filePath);
        }

        // Return relative path
        return filename;
    }

    /**
     * Optimize image to reduce file size while maintaining acceptable quality
     * Uses both resizing and compression techniques
     *
     * @param imageData Original image data
     * @param extension Image format extension
     * @return Optimized image data
     * @throws IOException If image processing fails
     */
    private byte[] optimizeImage(byte[] imageData, String extension) throws IOException {
        String formatName = extension.toLowerCase().replace(".", "");

        // Handle special case for PNG which doesn't support compression the same way
        if ("png".equals(formatName)) {
            return optimizePNG(imageData);
        }

        // For JPEG and other supported formats
        try (ByteArrayInputStream input = new ByteArrayInputStream(imageData)) {
            BufferedImage originalImage = ImageIO.read(input);

            // First try resizing if needed
            BufferedImage resizedImage = resizeImageIfNeeded(originalImage);

            // Try progressively lower quality settings until we achieve desired size
            for (float quality : QUALITY_STEPS) {
                byte[] compressedImage = compressImage(resizedImage, formatName, quality);

                if (compressedImage.length <= MAX_IMAGE_SIZE) {
                    logger.info("Image optimized to " + compressedImage.length + " bytes with quality " + quality);
                    return compressedImage;
                }
            }

            // If we get here, even the lowest quality didn't work
            // As a last resort, resize to even smaller dimensions
            BufferedImage smallerImage = resizeImage(resizedImage,
                    resizedImage.getWidth() / 2,
                    resizedImage.getHeight() / 2);

            return compressImage(smallerImage, formatName, QUALITY_STEPS[QUALITY_STEPS.length - 1]);
        }
    }

    /**
     * Optimize PNG images, which don't support lossy compression
     * Instead, we convert to JPEG if size is a concern
     *
     * @param imageData Original PNG data
     * @return Optimized image data
     * @throws IOException If image processing fails
     */
    private byte[] optimizePNG(byte[] imageData) throws IOException {
        try (ByteArrayInputStream input = new ByteArrayInputStream(imageData)) {
            BufferedImage originalImage = ImageIO.read(input);

            // First try resizing if needed
            BufferedImage resizedImage = resizeImageIfNeeded(originalImage);

            // Try PNG first (if it has transparency, we want to keep it if possible)
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(resizedImage, "png", outputStream);

            if (outputStream.size() <= MAX_IMAGE_SIZE) {
                logger.info("PNG optimized to " + outputStream.size() + " bytes with resizing");
                return outputStream.toByteArray();
            }

            // If still too large, convert to JPEG with quality settings
            // Note: This will lose transparency
            logger.info("Converting PNG to JPEG for better compression");

            // If image has alpha channel, blend with white background
            BufferedImage rgbImage;
            if (originalImage.getColorModel().hasAlpha()) {
                rgbImage = new BufferedImage(
                        resizedImage.getWidth(),
                        resizedImage.getHeight(),
                        BufferedImage.TYPE_INT_RGB
                );
                Graphics2D g2d = rgbImage.createGraphics();
                g2d.drawImage(resizedImage, 0, 0, null);
                g2d.dispose();
            } else {
                rgbImage = resizedImage;
            }

            // Compress as JPEG
            for (float quality : QUALITY_STEPS) {
                byte[] compressedImage = compressImage(rgbImage, "jpeg", quality);

                if (compressedImage.length <= MAX_IMAGE_SIZE) {
                    logger.info("PNG converted to JPEG, optimized to " + compressedImage.length + " bytes");
                    return compressedImage;
                }
            }

            // If we get here, even the lowest quality didn't work
            // As a last resort, resize to even smaller dimensions
            BufferedImage smallerImage = resizeImage(rgbImage,
                    rgbImage.getWidth() / 2,
                    rgbImage.getHeight() / 2);

            return compressImage(smallerImage, "jpeg", QUALITY_STEPS[QUALITY_STEPS.length - 1]);
        }
    }

    /**
     * Resize image if dimensions exceed MAX_WIDTH or MAX_HEIGHT
     * Maintains aspect ratio
     *
     * @param originalImage The original BufferedImage
     * @return Resized BufferedImage if needed, otherwise the original
     */
    private BufferedImage resizeImageIfNeeded(BufferedImage originalImage) {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        // Check if resizing is needed
        if (originalWidth <= MAX_WIDTH && originalHeight <= MAX_HEIGHT) {
            return originalImage;
        }

        // Calculate new dimensions maintaining aspect ratio
        int newWidth, newHeight;

        if (originalWidth > originalHeight) {
            newWidth = MAX_WIDTH;
            newHeight = (int) (originalHeight * ((double) MAX_WIDTH / originalWidth));
        } else {
            newHeight = MAX_HEIGHT;
            newWidth = (int) (originalWidth * ((double) MAX_HEIGHT / originalHeight));
        }

        logger.info("Resizing image from " + originalWidth + "x" + originalHeight +
                " to " + newWidth + "x" + newHeight);

        return resizeImage(originalImage, newWidth, newHeight);
    }

    /**
     * Resize image to specified dimensions
     *
     * @param originalImage The original BufferedImage
     * @param width Target width
     * @param height Target height
     * @return Resized BufferedImage
     */
    private BufferedImage resizeImage(BufferedImage originalImage, int width, int height) {
        Image resultingImage = originalImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        BufferedImage outputImage = new BufferedImage(width, height, originalImage.getType());
        Graphics2D g2d = outputImage.createGraphics();
        g2d.drawImage(resultingImage, 0, 0, null);
        g2d.dispose();

        return outputImage;
    }

    /**
     * Compress image using specified quality
     *
     * @param image BufferedImage to compress
     * @param formatName Image format name (jpeg, png, etc.)
     * @param quality Compression quality (0.0-1.0)
     * @return Compressed image bytes
     * @throws IOException If compression fails
     */
    private byte[] compressImage(BufferedImage image, String formatName, float quality) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // For JPEG, we can use compression
        if ("jpg".equals(formatName) || "jpeg".equals(formatName)) {
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName(formatName);
            if (!writers.hasNext()) {
                throw new IOException("No writers found for format: " + formatName);
            }

            ImageWriter writer = writers.next();
            ImageWriteParam param = writer.getDefaultWriteParam();

            // Set compression quality
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);

            // Write image
            try (ImageOutputStream ios = ImageIO.createImageOutputStream(outputStream)) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(image, null, null), param);
                writer.dispose();
            }
        } else {
            // For other formats, use standard write
            ImageIO.write(image, formatName, outputStream);
        }

        return outputStream.toByteArray();
    }

    /**
     * Delete an image from storage
     * @param imagePath Relative path to the image
     * @return true if deletion was successful
     */
    public boolean deleteImage(String imagePath) {
        try {
            Path file = Paths.get(uploadDir).resolve(imagePath);
            logger.info("Deleting image: " + file);
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            logger.warning("Failed to delete image: " + e.getMessage());
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
            return ".jpg"; // Default extension
        }
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return ".jpg"; // Default extension
        }

        String extension = filename.substring(lastIndexOf).toLowerCase();

        // Validate extension is supported
        if (!isValidImageExtension(extension)) {
            logger.warning("Unsupported image extension: " + extension + ", defaulting to .jpg");
            return ".jpg";
        }

        return extension;
    }

    /**
     * Check if file extension is a valid image extension
     */
    private boolean isValidImageExtension(String extension) {
        return extension.equals(".jpg") ||
                extension.equals(".jpeg") ||
                extension.equals(".png") ||
                extension.equals(".gif") ||
                extension.equals(".bmp");
    }
}