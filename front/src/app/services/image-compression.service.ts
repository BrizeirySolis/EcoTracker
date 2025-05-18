import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {

  /**
   * Comprime una imagen para reducir su tamaño
   * @param file Archivo de imagen a comprimir
   * @param maxSizeMB Tamaño máximo en MB
   * @param quality Calidad de la compresión (0-1)
   * @returns Promesa con el archivo comprimido
   */
  async compressImage(file: File, maxSizeMB: number = 1, quality: number = 0.7): Promise<File> {
    // Si la imagen ya es menor que el tamaño máximo, devolver sin comprimir
    if (file.size <= maxSizeMB * 1024 * 1024) {
      console.log('Image already under size limit, no compression needed');
      return file;
    }

    try {
      // Crear canvas y contexto para la compresión
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');

      // Calcular dimensiones para mantener la relación de aspecto
      let width = imageBitmap.width;
      let height = imageBitmap.height;

      // Establecer un límite máximo para las dimensiones iniciales
      const MAX_DIMENSION = 1920;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen en el canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto 2D');
      }

      ctx.drawImage(imageBitmap, 0, 0, width, height);

      // Intentar compresión con diferentes calidades hasta alcanzar el tamaño deseado
      let compressedBlob: Blob | null = null;
      let currentQuality = quality;

      while (currentQuality >= 0.2) {
        // Generar blob comprimido
        compressedBlob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => {
            resolve(blob as Blob);
          }, file.type, currentQuality);
        });

        if (compressedBlob && compressedBlob.size <= maxSizeMB * 1024 * 1024) {
          break; // Tamaño aceptable alcanzado
        }

        // Reducir calidad e intentar de nuevo
        currentQuality -= 0.1;
      }

      // Si aún es demasiado grande, reducir las dimensiones
      if (compressedBlob && compressedBlob.size > maxSizeMB * 1024 * 1024) {
        // Reducir dimensiones a la mitad
        canvas.width = Math.floor(width / 2);
        canvas.height = Math.floor(height / 2);

        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

        compressedBlob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => {
            resolve(blob as Blob);
          }, file.type, 0.7); // Calidad moderada
        });
      }

      if (!compressedBlob) {
        throw new Error('Failed to compress image');
      }

      console.log(`Compressed image from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);

      // Crear nuevo archivo con el blob comprimido
      const compressedFile = new File(
        [compressedBlob],
        file.name,
        { type: file.type, lastModified: file.lastModified }
      );

      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Devolver archivo original en caso de error
    }
  }
}
