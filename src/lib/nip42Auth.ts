import type { NostrEvent } from '@nostrify/nostrify';
import type { NUser } from '@nostrify/react/login';

/**
 * Creates a NIP-42 authentication event (kind 22242) for relay authentication.
 * 
 * @param challenge - The challenge string received from the relay
 * @param relayUrl - The URL of the relay requesting authentication
 * @param user - The current user with signer capability
 * @returns Promise resolving to the signed authentication event
 */
export async function createAuthEvent(
  challenge: string,
  relayUrl: string,
  user: NUser
): Promise<NostrEvent> {
  if (!user.signer) {
    throw new Error('No signer available for authentication');
  }

  // Create the NIP-42 authentication event
  const authEvent = {
    kind: 22242,
    created_at: Math.floor(Date.now() / 1000),
    content: '',
    tags: [
      ['relay', relayUrl],
      ['challenge', challenge]
    ]
  };

  // Sign the event using the user's signer
  const signedEvent = await user.signer.signEvent(authEvent);
  
  return signedEvent;
}

/**
 * Creates an authentication callback function for NRelay1 that uses the current user.
 * 
 * @param user - The current user with signer capability
 * @param relayUrl - The URL of the relay for authentication
 * @returns Authentication callback function
 */
export function createAuthCallback(user: NUser, relayUrl: string) {
  return async (challenge: string): Promise<NostrEvent> => {
    return createAuthEvent(challenge, relayUrl, user);
  };
}