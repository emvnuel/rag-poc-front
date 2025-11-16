/**
 * Unit tests for project validation schemas.
 *
 * Tests Zod schemas for project creation and updates.
 */

import { describe, it, expect } from 'vitest';
import {
  projectCreateSchema,
  projectUpdateSchema,
  type ProjectCreateInput,
  type ProjectUpdateInput,
} from './project';

describe('projectCreateSchema', () => {
  it('should validate valid project name', () => {
    const validInput: ProjectCreateInput = {
      name: 'My RAG Project',
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  it('should accept project name with special characters', () => {
    const validInput = {
      name: 'Project: ML & AI (2024)',
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should accept project name with numbers', () => {
    const validInput = {
      name: 'Project123',
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should accept project name with unicode characters', () => {
    const validInput = {
      name: 'プロジェクト',
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should accept single character name', () => {
    const validInput = {
      name: 'A',
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should accept very long project name', () => {
    const validInput = {
      name: 'x'.repeat(1000),
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject empty project name', () => {
    const invalidInput = {
      name: '',
    };

    const result = projectCreateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name is required');
    }
  });

  it('should reject whitespace-only project name', () => {
    const invalidInput = {
      name: '   ',
    };

    const result = projectCreateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name cannot be empty');
    }
  });

  it('should reject project name with only newlines', () => {
    const invalidInput = {
      name: '\n\n\n',
    };

    const result = projectCreateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name cannot be empty');
    }
  });

  it('should reject project name with only tabs', () => {
    const invalidInput = {
      name: '\t\t\t',
    };

    const result = projectCreateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name cannot be empty');
    }
  });

  it('should reject missing name field', () => {
    const invalidInput = {};

    const result = projectCreateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should accept project name with leading/trailing spaces', () => {
    // Schema validates non-empty content, trimming is app logic
    const validInput = {
      name: '  Project Name  ',
    };

    const result = projectCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });
});

describe('projectUpdateSchema', () => {
  it('should validate valid project update', () => {
    const validInput: ProjectUpdateInput = {
      name: 'Updated Project Name',
    };

    const result = projectUpdateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  it('should have same validation as create schema', () => {
    // projectUpdateSchema is an alias of projectCreateSchema
    expect(projectUpdateSchema).toBe(projectCreateSchema);
  });

  it('should reject empty name in update', () => {
    const invalidInput = {
      name: '',
    };

    const result = projectUpdateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name is required');
    }
  });

  it('should reject whitespace-only name in update', () => {
    const invalidInput = {
      name: '   ',
    };

    const result = projectUpdateSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name cannot be empty');
    }
  });

  it('should accept valid name with special characters in update', () => {
    const validInput = {
      name: 'Updated: Project @ 2024',
    };

    const result = projectUpdateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });
});
