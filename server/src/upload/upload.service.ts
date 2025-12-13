import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicEndpoint: string;

  constructor() {
    // Extract bucket name from endpoint if present
    // R2_ENDPOINT format: https://account-id.r2.cloudflarestorage.com or with /bucket-name
    const endpoint = process.env.R2_ENDPOINT || '';
    
    try {
      const endpointUrl = new URL(endpoint);
      
      // If endpoint has a path, use it as bucket name, otherwise use default
      const pathParts = endpointUrl.pathname.split('/').filter(Boolean);
      this.bucketName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'shafa';
      
      // Clean endpoint URL (remove bucket name from path if present)
      const cleanEndpoint = endpointUrl.origin;

      // Initialize S3 client for Cloudflare R2
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: cleanEndpoint,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      });

      this.publicEndpoint = process.env.R2_PUBLIC_ENDPOINT || 'https://r2.shafa.id';

      this.logger.log(`R2 Upload Service initialized - Bucket: ${this.bucketName}, Endpoint: ${cleanEndpoint}`);
    } catch (error) {
      this.logger.error(`Failed to initialize R2 client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate file type
   */
  validateFileType(filename: string): boolean {
    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  }

  /**
   * Validate image file type
   */
  validateImageType(filename: string): boolean {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  }

  /**
   * Validate file size (max 10MB)
   */
  validateFileSize(size: number): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    return size <= maxSize;
  }

  /**
   * Get MIME type from filename
   */
  getMimeType(filename: string): string {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Get image MIME type from filename
   */
  getImageMimeType(filename: string): string {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Generate unique file key for R2
   */
  generateFileKey(originalname: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = originalname.substring(originalname.lastIndexOf('.'));
    const sanitizedName = originalname
      .substring(0, originalname.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    
    return `course-materials/${timestamp}-${uuid}-${sanitizedName}${extension}`;
  }

  /**
   * Generate unique image key for R2
   */
  generateImageKey(originalname: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = originalname.substring(originalname.lastIndexOf('.'));
    const sanitizedName = originalname
      .substring(0, originalname.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    
    return `course-thumbnails/${timestamp}-${uuid}-${sanitizedName}${extension}`;
  }

  /**
   * Upload file to Cloudflare R2
   */
  async uploadFile(file: {
    originalname: string;
    size: number;
    buffer: Buffer;
    mimetype?: string;
  }): Promise<{ url: string; filename: string; size: number; key: string }> {
    // Validate file
    if (!this.validateFileType(file.originalname)) {
      throw new BadRequestException(
        'File type not allowed. Allowed types: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX',
      );
    }

    if (!this.validateFileSize(file.size)) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    try {
      // Generate unique file key
      const fileKey = this.generateFileKey(file.originalname);
      const mimeType = file.mimetype || this.getMimeType(file.originalname);

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: mimeType,
        // Make file publicly readable (adjust based on your needs)
        // ACL: 'public-read', // R2 doesn't support ACL, use public bucket or signed URLs
      });

      await this.s3Client.send(command);

      // Generate public URL
      const publicUrl = `${this.publicEndpoint}/${fileKey}`;

      this.logger.log(`File uploaded successfully: ${fileKey}`);

      return {
        url: publicUrl,
        filename: file.originalname,
        size: file.size,
        key: fileKey,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to R2: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload image to Cloudflare R2
   */
  async uploadImage(file: {
    originalname: string;
    size: number;
    buffer: Buffer;
    mimetype?: string;
  }): Promise<{ url: string; filename: string; size: number; key: string }> {
    // Validate image
    if (!this.validateImageType(file.originalname)) {
      throw new BadRequestException(
        'Image type not allowed. Allowed types: JPG, JPEG, PNG, GIF, WEBP',
      );
    }

    // Max size for images: 5MB
    const maxImageSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxImageSize) {
      throw new BadRequestException('Image size exceeds 5MB limit');
    }

    try {
      // Generate unique image key
      const imageKey = this.generateImageKey(file.originalname);
      const mimeType = file.mimetype || this.getImageMimeType(file.originalname);

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: imageKey,
        Body: file.buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      // Generate public URL
      const publicUrl = `${this.publicEndpoint}/${imageKey}`;

      this.logger.log(`Image uploaded successfully: ${imageKey}`);

      return {
        url: publicUrl,
        filename: file.originalname,
        size: file.size,
        key: imageKey,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image to R2: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }
}


