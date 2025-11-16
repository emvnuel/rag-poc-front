/**
 * Unit tests for document validation schemas.
 *
 * Tests Zod schemas for file uploads, text processing, and website processing.
 */

import { describe, it, expect } from 'vitest';
import {
  fileUploadSchema,
  textRequestSchema,
  websiteRequestSchema,
  type FileUploadInput,
  type TextRequestInput,
  type WebsiteRequestInput,
} from './document';

describe('fileUploadSchema', () => {
  const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob(['x'.repeat(size)], { type });
    return new File([blob], name, { type });
  };

  it('should validate valid PDF file', () => {
    const file = createMockFile('document.pdf', 1024 * 1024, 'application/pdf');
    const validInput: FileUploadInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should validate valid DOCX file', () => {
    const file = createMockFile(
      'document.docx',
      1024 * 1024,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    const validInput: FileUploadInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should validate valid TXT file', () => {
    const file = createMockFile('document.txt', 1024, 'text/plain');
    const validInput: FileUploadInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should validate valid MD file', () => {
    const file = createMockFile('document.md', 1024, 'text/markdown');
    const validInput: FileUploadInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject file larger than 25MB', () => {
    const file = createMockFile(
      'large.pdf',
      26 * 1024 * 1024, // 26 MB
      'application/pdf'
    );
    const invalidInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('File size must be less than 25MB');
    }
  });

  it('should reject unsupported file type', () => {
    const file = createMockFile('image.jpg', 1024, 'image/jpeg');
    const invalidInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('File type must be PDF, DOCX, TXT, or MD');
    }
  });

  it('should accept file at exactly 25MB limit', () => {
    const file = createMockFile(
      'exact-limit.pdf',
      25 * 1024 * 1024, // Exactly 25 MB
      'application/pdf'
    );
    const validInput = {
      file,
      projectId: validProjectId,
    };

    const result = fileUploadSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject invalid project ID format', () => {
    const file = createMockFile('document.pdf', 1024, 'application/pdf');
    const invalidInput = {
      file,
      projectId: 'not-a-uuid',
    };

    const result = fileUploadSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid project ID');
    }
  });

  it('should reject empty project ID', () => {
    const file = createMockFile('document.pdf', 1024, 'application/pdf');
    const invalidInput = {
      file,
      projectId: '',
    };

    const result = fileUploadSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe('textRequestSchema', () => {
  const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

  it('should validate valid text request', () => {
    const validRequest: TextRequestInput = {
      text: 'This is sample text content',
      projectId: validProjectId,
    };

    const result = textRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it('should accept text with special characters', () => {
    const validRequest = {
      text: 'Text with special chars: @#$%^&*()',
      projectId: validProjectId,
    };

    const result = textRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should accept text with newlines', () => {
    const validRequest = {
      text: 'Line 1\nLine 2\nLine 3',
      projectId: validProjectId,
    };

    const result = textRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should accept very long text', () => {
    const longText = 'x'.repeat(10000);
    const validRequest = {
      text: longText,
      projectId: validProjectId,
    };

    const result = textRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject empty text', () => {
    const invalidRequest = {
      text: '',
      projectId: validProjectId,
    };

    const result = textRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Text cannot be empty');
    }
  });

  it('should reject invalid project ID format', () => {
    const invalidRequest = {
      text: 'Valid text content',
      projectId: 'invalid-uuid',
    };

    const result = textRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid project ID');
    }
  });

  it('should reject missing text field', () => {
    const invalidRequest = {
      projectId: validProjectId,
    };

    const result = textRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});

describe('websiteRequestSchema', () => {
  const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

  it('should validate valid HTTP URL', () => {
    const validRequest: WebsiteRequestInput = {
      url: 'http://example.com',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it('should validate valid HTTPS URL', () => {
    const validRequest: WebsiteRequestInput = {
      url: 'https://example.com',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate URL with path', () => {
    const validRequest = {
      url: 'https://example.com/path/to/page',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate URL with query parameters', () => {
    const validRequest = {
      url: 'https://example.com/page?param1=value1&param2=value2',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate URL with port', () => {
    const validRequest = {
      url: 'https://example.com:8080/path',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate URL with subdomain', () => {
    const validRequest = {
      url: 'https://subdomain.example.com',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject invalid URL format', () => {
    const invalidRequest = {
      url: 'not-a-url',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid URL');
    }
  });

  it('should reject empty URL', () => {
    const invalidRequest = {
      url: '',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Empty string fails URL validation first
      expect(result.error.issues[0].message).toContain('Invalid');
    }
  });

  it('should reject URL without protocol', () => {
    const invalidRequest = {
      url: 'example.com',
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid URL');
    }
  });

  it('should reject invalid project ID format', () => {
    const invalidRequest = {
      url: 'https://example.com',
      projectId: 'not-a-uuid',
    };

    const result = websiteRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid project ID');
    }
  });

  it('should reject missing URL field', () => {
    const invalidRequest = {
      projectId: validProjectId,
    };

    const result = websiteRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});
