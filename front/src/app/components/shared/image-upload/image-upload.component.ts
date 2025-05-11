import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable component for image upload functionality
 * Supports drag-and-drop, file selection, and image preview
 */
@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="image-upload-container"
      [class.has-image]="imagePreview"
      [class.dragover]="isDraggingOver"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)">

      <div *ngIf="!imagePreview" class="upload-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
          <line x1="16" y1="5" x2="22" y2="5"></line>
          <line x1="19" y1="2" x2="19" y2="8"></line>
          <circle cx="9" cy="9" r="2"></circle>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </svg>
        <button type="button" class="select-button" (click)="openFileDialog()">
          Seleccionar imagen
        </button>
      </div>

      <div *ngIf="imagePreview" class="image-preview-container">
        <img [src]="imagePreview" alt="Vista previa de imagen" class="image-preview">
        <div class="image-actions">
          <button type="button" class="remove-button" (click)="removeImage()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
            Eliminar
          </button>
          <button type="button" class="change-button" (click)="openFileDialog()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Cambiar
          </button>
        </div>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Input de archivo oculto (fuera del *ngIf) -->
      <input
        #fileInput
        type="file"
        accept="image/*"
        class="file-input"
        (change)="onFileSelected($event)"
        [attr.aria-label]="'Seleccionar imagen'">
    </div>
  `,
  styles: `
    .image-upload-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      background-color: #f9f9f9;
      transition: all 0.3s ease;
      position: relative;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .image-upload-container.dragover {
      border-color: #00b359;
      background-color: rgba(0, 179, 89, 0.05);
    }

    .image-upload-container.has-image {
      border-style: solid;
      background-color: #fff;
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #666;
    }

    .upload-placeholder svg {
      color: #888;
      margin-bottom: 16px;
    }

    .upload-text {
      margin-bottom: 16px;
      font-size: 1rem;
    }

    .upload-text span {
      display: inline-block;
      margin: 8px 0;
      font-size: 0.9rem;
      color: #888;
    }

    .select-button {
      background-color: #00b359;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    .select-button:hover {
      background-color: #009649;
    }

    .file-input {
      display: none;
    }

    .image-preview-container {
      width: 100%;
      position: relative;
    }

    .image-preview {
      max-width: 100%;
      max-height: 300px;
      border-radius: 4px;
      object-fit: contain;
    }

    .image-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }

    .remove-button, .change-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .remove-button {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .change-button {
      background-color: #e2f3ff;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .remove-button:hover {
      background-color: #f1b0b7;
    }

    .change-button:hover {
      background-color: #d1ecf1;
    }

    .error-message {
      margin-top: 8px;
      color: #dc3545;
      font-size: 0.9rem;
    }
  `
})
export class ImageUploadComponent implements OnInit {
  @Input() existingImageUrl?: string;
  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageRemoved = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imagePreview: string | null = null;
  isDraggingOver = false;
  error: string | null = null;
  selectedFile: File | null = null;

  // Maximum file size in bytes (15MB)
  private readonly MAX_FILE_SIZE = 15 * 1024 * 1024;
  // Allowed file types
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  ngOnInit() {
    if (this.existingImageUrl) {
      this.imagePreview = this.existingImageUrl;
    }
  }

  ngOnChanges() {
    if (this.existingImageUrl) {
      this.imagePreview = this.existingImageUrl;
    }
  }

  /**
   * Open file dialog programmatically
   * This solves the issue with fileInput being undefined in template
   */
  openFileDialog(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle dragover event to show visual feedback
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  /**
   * Handle dragleave event to reset visual feedback
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  /**
   * Handle file drop event to process dropped files
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  /**
   * Handle file selection from input element
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  /**
   * Remove the selected image
   */
  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.error = null;
    this.imageRemoved.emit();

    // Reset the file input to allow selecting the same file again
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Process and validate the selected file
   */
  private processFile(file: File) {
    this.error = null;

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.error = 'Formato no válido. Por favor, selecciona una imagen (JPEG, PNG, GIF o WebP).';
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.error = 'La imagen es demasiado grande. El tamaño máximo permitido es 15MB.';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Store and emit the file
    this.selectedFile = file;
    this.imageSelected.emit(file);
  }
}
