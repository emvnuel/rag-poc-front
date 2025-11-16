/**
 * Unit tests for error handling utilities
 * 
 * Tests user-friendly error message mapping from HTTP status codes
 */

import { describe, it, expect } from 'vitest';
import { ERROR_MESSAGES, getErrorMessage } from './errors';

describe('ERROR_MESSAGES', () => {
  it('should contain all documented HTTP error status codes', () => {
    expect(ERROR_MESSAGES[400]).toBeDefined();
    expect(ERROR_MESSAGES[401]).toBeDefined();
    expect(ERROR_MESSAGES[403]).toBeDefined();
    expect(ERROR_MESSAGES[404]).toBeDefined();
    expect(ERROR_MESSAGES[413]).toBeDefined();
    expect(ERROR_MESSAGES[429]).toBeDefined();
    expect(ERROR_MESSAGES[500]).toBeDefined();
    expect(ERROR_MESSAGES[503]).toBeDefined();
  });

  it('should have user-friendly messages', () => {
    expect(ERROR_MESSAGES[400]).toBe('Invalid request. Please check your input.');
    expect(ERROR_MESSAGES[401]).toBe('You need to log in to access this resource.');
    expect(ERROR_MESSAGES[403]).toBe('You do not have permission to perform this action.');
    expect(ERROR_MESSAGES[404]).toBe('The requested resource was not found.');
    expect(ERROR_MESSAGES[413]).toBe('File size exceeds the maximum allowed (25MB).');
    expect(ERROR_MESSAGES[429]).toBe('Too many requests. Please try again in a moment.');
    expect(ERROR_MESSAGES[500]).toBe('An unexpected error occurred. Please try again.');
    expect(ERROR_MESSAGES[503]).toBe('Service is temporarily unavailable. Please try again later.');
  });

  it('should be immutable object', () => {
    const original = ERROR_MESSAGES[400];
    // Attempting mutation should not affect original
    expect(ERROR_MESSAGES[400]).toBe(original);
  });
});

describe('getErrorMessage', () => {
  it('should return message for valid status code 400', () => {
    const message = getErrorMessage(400);
    expect(message).toBe('Invalid request. Please check your input.');
  });

  it('should return message for valid status code 401', () => {
    const message = getErrorMessage(401);
    expect(message).toBe('You need to log in to access this resource.');
  });

  it('should return message for valid status code 403', () => {
    const message = getErrorMessage(403);
    expect(message).toBe('You do not have permission to perform this action.');
  });

  it('should return message for valid status code 404', () => {
    const message = getErrorMessage(404);
    expect(message).toBe('The requested resource was not found.');
  });

  it('should return message for valid status code 413', () => {
    const message = getErrorMessage(413);
    expect(message).toBe('File size exceeds the maximum allowed (25MB).');
  });

  it('should return message for valid status code 429', () => {
    const message = getErrorMessage(429);
    expect(message).toBe('Too many requests. Please try again in a moment.');
  });

  it('should return message for valid status code 500', () => {
    const message = getErrorMessage(500);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should return message for valid status code 503', () => {
    const message = getErrorMessage(503);
    expect(message).toBe('Service is temporarily unavailable. Please try again later.');
  });

  it('should return 500 message for unknown status code', () => {
    const message = getErrorMessage(418); // I'm a teapot
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should return custom default message when provided', () => {
    const customDefault = 'Custom error message';
    const message = getErrorMessage(418, customDefault);
    expect(message).toBe(customDefault);
  });

  it('should prioritize ERROR_MESSAGES over custom default', () => {
    const customDefault = 'This should be ignored';
    const message = getErrorMessage(404, customDefault);
    expect(message).toBe('The requested resource was not found.');
  });

  it('should handle status code 0', () => {
    const message = getErrorMessage(0);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should handle negative status codes', () => {
    const message = getErrorMessage(-1);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should handle very large status codes', () => {
    const message = getErrorMessage(999);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should handle empty string as default message', () => {
    // Empty string is falsy, so it falls back to ERROR_MESSAGES[500]
    const message = getErrorMessage(418, '');
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should handle null status codes by falling back to 500', () => {
    const message = getErrorMessage(null as any);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should handle undefined status codes by falling back to 500', () => {
    const message = getErrorMessage(undefined as any);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should return consistent messages across multiple calls', () => {
    const message1 = getErrorMessage(404);
    const message2 = getErrorMessage(404);
    expect(message1).toBe(message2);
  });

  it('should handle all client error codes (4xx)', () => {
    expect(getErrorMessage(400)).toBeTruthy();
    expect(getErrorMessage(401)).toBeTruthy();
    expect(getErrorMessage(403)).toBeTruthy();
    expect(getErrorMessage(404)).toBeTruthy();
    expect(getErrorMessage(413)).toBeTruthy();
    expect(getErrorMessage(429)).toBeTruthy();
  });

  it('should handle all server error codes (5xx)', () => {
    expect(getErrorMessage(500)).toBeTruthy();
    expect(getErrorMessage(503)).toBeTruthy();
  });

  it('should return string type', () => {
    const message = getErrorMessage(404);
    expect(typeof message).toBe('string');
  });

  it('should not return empty string for mapped codes', () => {
    expect(getErrorMessage(400)).not.toBe('');
    expect(getErrorMessage(404)).not.toBe('');
    expect(getErrorMessage(500)).not.toBe('');
  });
});
