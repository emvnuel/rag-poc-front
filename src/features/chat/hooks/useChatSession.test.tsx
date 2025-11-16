/**
 * Unit tests for useChatSession hook
 * 
 * Tests chat session state management including:
 * - Message history management
 * - Context window limiting (max 10 messages)
 * - Clear functionality
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChatSession } from './useChatSession';
import type { ChatMessage } from '@/services/api/generated/types.gen';

describe('useChatSession', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChatSession());

    expect(result.current.messages).toEqual([]);
  });

  it('should add a user message', () => {
    const { result } = renderHook(() => useChatSession());

    const userMessage: ChatMessage = {
      role: 'user',
      content: 'What is RAG?',
    };

    act(() => {
      result.current.addMessage(userMessage);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(userMessage);
  });

  it('should add an assistant message', () => {
    const { result } = renderHook(() => useChatSession());

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: 'RAG stands for Retrieval-Augmented Generation.',
    };

    act(() => {
      result.current.addMessage(assistantMessage);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(assistantMessage);
  });

  it('should add multiple messages in sequence', () => {
    const { result } = renderHook(() => useChatSession());

    const message1: ChatMessage = { role: 'user', content: 'Question 1' };
    const message2: ChatMessage = { role: 'assistant', content: 'Answer 1' };
    const message3: ChatMessage = { role: 'user', content: 'Question 2' };

    act(() => {
      result.current.addMessage(message1);
      result.current.addMessage(message2);
      result.current.addMessage(message3);
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[0]).toEqual(message1);
    expect(result.current.messages[1]).toEqual(message2);
    expect(result.current.messages[2]).toEqual(message3);
  });

  it('should maintain message order', () => {
    const { result } = renderHook(() => useChatSession());

    const messages: ChatMessage[] = [
      { role: 'user', content: 'Message 1' },
      { role: 'assistant', content: 'Message 2' },
      { role: 'user', content: 'Message 3' },
      { role: 'assistant', content: 'Message 4' },
      { role: 'user', content: 'Message 5' },
    ];

    act(() => {
      messages.forEach(msg => result.current.addMessage(msg));
    });

    expect(result.current.messages).toEqual(messages);
  });

  it('should clear all messages', () => {
    const { result } = renderHook(() => useChatSession());

    // Add some messages first
    act(() => {
      result.current.addMessage({ role: 'user', content: 'Test 1' });
      result.current.addMessage({ role: 'assistant', content: 'Test 2' });
      result.current.addMessage({ role: 'user', content: 'Test 3' });
    });

    expect(result.current.messages).toHaveLength(3);

    // Clear messages
    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
  });

  it('should return history within max length (10 messages)', () => {
    const { result } = renderHook(() => useChatSession());

    // Add 8 messages (within limit)
    act(() => {
      for (let i = 0; i < 8; i++) {
        result.current.addMessage({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`,
        });
      }
    });

    const history = result.current.getHistory();
    
    expect(history).toHaveLength(8);
    expect(history).toEqual(result.current.messages);
  });

  it('should limit history to last 10 messages when exceeding limit', () => {
    const { result } = renderHook(() => useChatSession());

    // Add 15 messages (exceeding limit of 10)
    const messages: ChatMessage[] = [];
    act(() => {
      for (let i = 0; i < 15; i++) {
        const msg: ChatMessage = {
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`,
        };
        messages.push(msg);
        result.current.addMessage(msg);
      }
    });

    const history = result.current.getHistory();
    
    // Should return only last 10 messages
    expect(history).toHaveLength(10);
    
    // Should be messages 6-15 (last 10)
    const expectedMessages = messages.slice(-10);
    expect(history).toEqual(expectedMessages);
    
    // Verify content
    expect(history[0].content).toBe('Message 6');
    expect(history[9].content).toBe('Message 15');
  });

  it('should return exactly 10 messages at the boundary', () => {
    const { result } = renderHook(() => useChatSession());

    // Add exactly 10 messages
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.addMessage({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`,
        });
      }
    });

    const history = result.current.getHistory();
    
    expect(history).toHaveLength(10);
    expect(history).toEqual(result.current.messages);
  });

  it('should return updated history after adding 11th message', () => {
    const { result } = renderHook(() => useChatSession());

    const messages: ChatMessage[] = [];
    
    // Add 11 messages
    act(() => {
      for (let i = 0; i < 11; i++) {
        const msg: ChatMessage = {
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`,
        };
        messages.push(msg);
        result.current.addMessage(msg);
      }
    });

    const history = result.current.getHistory();
    
    // Should return messages 2-11 (last 10)
    expect(history).toHaveLength(10);
    expect(history[0].content).toBe('Message 2');
    expect(history[9].content).toBe('Message 11');
  });

  it('should return empty array when no messages exist', () => {
    const { result } = renderHook(() => useChatSession());

    const history = result.current.getHistory();
    
    expect(history).toEqual([]);
  });

  it('should update history correctly after clear', () => {
    const { result } = renderHook(() => useChatSession());

    // Add messages
    act(() => {
      result.current.addMessage({ role: 'user', content: 'Test 1' });
      result.current.addMessage({ role: 'assistant', content: 'Test 2' });
    });

    // Clear
    act(() => {
      result.current.clearMessages();
    });

    const history = result.current.getHistory();
    expect(history).toEqual([]);

    // Add new messages after clear
    act(() => {
      result.current.addMessage({ role: 'user', content: 'New message' });
    });

    const newHistory = result.current.getHistory();
    expect(newHistory).toHaveLength(1);
    expect(newHistory[0].content).toBe('New message');
  });

  it('should handle messages with empty content', () => {
    const { result } = renderHook(() => useChatSession());

    const emptyMessage: ChatMessage = {
      role: 'user',
      content: '',
    };

    act(() => {
      result.current.addMessage(emptyMessage);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('');
  });

  it('should handle messages with special characters', () => {
    const { result } = renderHook(() => useChatSession());

    const specialMessage: ChatMessage = {
      role: 'user',
      content: 'Special chars: @#$%^&*() 🚀 \n\t',
    };

    act(() => {
      result.current.addMessage(specialMessage);
    });

    expect(result.current.messages[0]).toEqual(specialMessage);
  });

  it('should not mutate original messages array', () => {
    const { result } = renderHook(() => useChatSession());

    act(() => {
      result.current.addMessage({ role: 'user', content: 'Test' });
    });

    const firstSnapshot = result.current.messages;

    act(() => {
      result.current.addMessage({ role: 'assistant', content: 'Response' });
    });

    // Original snapshot should remain unchanged
    expect(firstSnapshot).toHaveLength(1);
    expect(result.current.messages).toHaveLength(2);
  });

  it('should provide stable function references', () => {
    const { result, rerender } = renderHook(() => useChatSession());

    const addMessageRef = result.current.addMessage;
    const clearMessagesRef = result.current.clearMessages;

    // Trigger re-render
    rerender();

    // Function references should remain the same (useCallback memoization)
    expect(result.current.addMessage).toBe(addMessageRef);
    expect(result.current.clearMessages).toBe(clearMessagesRef);
    // getHistory depends on messages, so it will change when messages update
  });
});
