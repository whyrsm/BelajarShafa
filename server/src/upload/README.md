# Upload Service - Cloudflare R2 Integration

This service handles file uploads to Cloudflare R2 storage.

## Configuration

The service uses the following environment variables from `.env`:

- `R2_ACCOUNT_ID` - Cloudflare R2 Account ID
- `R2_ACCESS_KEY_ID` - R2 Access Key ID
- `R2_SECRET_ACCESS_KEY` - R2 Secret Access Key
- `R2_ENDPOINT` - R2 Endpoint URL (e.g., `https://account-id.r2.cloudflarestorage.com/bucket-name`)
- `R2_PUBLIC_ENDPOINT` - Public URL for accessing files (e.g., `https://r2.shafa.id`)

## Bucket Configuration

For the upload service to work correctly, ensure your R2 bucket is configured:

1. **Public Access**: If you want files to be publicly accessible via the public endpoint, configure your R2 bucket to allow public access. Alternatively, you can use signed URLs (not implemented yet).

2. **CORS**: If uploading from a browser, ensure CORS is configured on your R2 bucket to allow requests from your domain.

## File Validation

- **Allowed Types**: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX
- **Max Size**: 10MB

## Usage

The service automatically:
- Validates file type and size
- Generates unique file keys with timestamps and UUIDs
- Uploads files to R2
- Returns public URLs for uploaded files

## File Structure

Uploaded files are stored in R2 with the following structure:
```
course-materials/{timestamp}-{uuid}-{sanitized-filename}.{ext}
```

Example: `course-materials/1703123456789-abc123-def456-my-document.pdf`


