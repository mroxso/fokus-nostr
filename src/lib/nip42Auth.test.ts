import { describe, it, expect, vi, type MockedFunction } from 'vitest';
import { createAuthEvent, createAuthCallback } from './nip42Auth';
import type { NUser } from '@nostrify/react/login';

// Mock NUser for testing
const createMockUser = (pubkey = 'test-pubkey'): NUser => {
  const mockSigner = {
    getPublicKey: vi.fn().mockResolvedValue(pubkey),
    signEvent: vi.fn().mockImplementation((event) => Promise.resolve({
      id: 'signed-event-id',
      kind: event.kind,
      pubkey,
      created_at: event.created_at,
      content: event.content,
      tags: event.tags,
      sig: 'mock-signature'
    }))
  };

  return {
    pubkey,
    signer: mockSigner,
    method: 'nsec' as const
  } as NUser;
};

describe('NIP-42 Authentication', () => {
  describe('createAuthEvent', () => {
    it('creates a valid NIP-42 authentication event', async () => {
      const challenge = 'test-challenge-string';
      const relayUrl = 'wss://test.relay.com';
      const user = createMockUser();

      const result = await createAuthEvent(challenge, relayUrl, user);

      expect(result).toBeDefined();
      expect(result.kind).toBe(22242);
      expect(result.tags).toContainEqual(['relay', relayUrl]);
      expect(result.tags).toContainEqual(['challenge', challenge]);
      expect(result.content).toBe('');
      expect(user.signer.signEvent).toHaveBeenCalledWith({
        kind: 22242,
        created_at: expect.any(Number),
        content: '',
        tags: [
          ['relay', relayUrl],
          ['challenge', challenge]
        ]
      });
    });

    it('throws error when user has no signer', async () => {
      const challenge = 'test-challenge';
      const relayUrl = 'wss://test.relay.com';
      const user = { 
        pubkey: 'test-pubkey', 
        signer: null,
        method: 'nsec' as const
      } as unknown as NUser;

      await expect(createAuthEvent(challenge, relayUrl, user)).rejects.toThrow(
        'No signer available for authentication'
      );
    });

    it('uses current timestamp for created_at', async () => {
      const challenge = 'test-challenge';
      const relayUrl = 'wss://test.relay.com';
      const user = createMockUser();
      
      const beforeTime = Math.floor(Date.now() / 1000);
      await createAuthEvent(challenge, relayUrl, user);
      const afterTime = Math.floor(Date.now() / 1000);

      const callArgs = (user.signer.signEvent as MockedFunction<typeof user.signer.signEvent>).mock.calls[0][0];
      expect(callArgs.created_at).toBeGreaterThanOrEqual(beforeTime);
      expect(callArgs.created_at).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('createAuthCallback', () => {
    it('returns a function that creates auth events', async () => {
      const user = createMockUser();
      const relayUrl = 'wss://test.relay.com';
      const challenge = 'callback-test-challenge';

      const authCallback = createAuthCallback(user, relayUrl);
      const result = await authCallback(challenge);

      expect(result).toBeDefined();
      expect(result.kind).toBe(22242);
      expect(user.signer.signEvent).toHaveBeenCalledWith({
        kind: 22242,
        created_at: expect.any(Number),
        content: '',
        tags: [
          ['relay', relayUrl],
          ['challenge', challenge]
        ]
      });
    });

    it('can be called multiple times with different challenges', async () => {
      const user = createMockUser();
      const relayUrl = 'wss://test.relay.com';
      const authCallback = createAuthCallback(user, relayUrl);

      await authCallback('challenge-1');
      await authCallback('challenge-2');

      expect(user.signer.signEvent).toHaveBeenCalledTimes(2);
      expect(user.signer.signEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({
        tags: expect.arrayContaining([['challenge', 'challenge-1']])
      }));
      expect(user.signer.signEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({
        tags: expect.arrayContaining([['challenge', 'challenge-2']])
      }));
    });
  });
});