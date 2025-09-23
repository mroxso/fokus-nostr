import React, { useEffect, useRef } from 'react';
import { NostrEvent, NPool, NRelay1 } from '@nostrify/nostrify';
import { NostrContext } from '@nostrify/react';
import { useNostrLogin } from '@nostrify/react/login';
import { NUser } from '@nostrify/react/login';
import { useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '@/hooks/useAppContext';
import { createAuthCallback } from '@/lib/nip42Auth';

interface NostrProviderProps {
  children: React.ReactNode;
}

const NostrProvider: React.FC<NostrProviderProps> = (props) => {
  const { children } = props;
  const { config, presetRelays } = useAppContext();
  const { logins } = useNostrLogin();

  const queryClient = useQueryClient();

  // Create NPool instance that gets recreated when user auth state changes
  const pool = useRef<NPool | undefined>(undefined);

  // Get the current user from the first login (if any)
  const currentUser = logins.length > 0 ? (() => {
    try {
      const login = logins[0];
      switch (login.type) {
        case 'nsec':
          return NUser.fromNsecLogin(login);
        case 'extension':
          return NUser.fromExtensionLogin(login);
        case 'bunker':
          // For bunker, authentication will be handled after connection
          // The bunker signer will handle authentication via NIP-46
          return null;
        default:
          return null;
      }
    } catch {
      return null;
    }
  })() : null;

  const authStateRef = useRef<string | undefined>(currentUser?.pubkey);

  // Use refs so the pool always has the latest data
  const relayUrl = useRef<string>(config.relayUrl);

  // Update refs when config changes and reset pool if auth state changes
  useEffect(() => {
    relayUrl.current = config.relayUrl;
    
    // Reset pool if authentication state changed (user logged in/out or switched)
    const newAuthState = currentUser?.pubkey;
    if (authStateRef.current !== newAuthState) {
      authStateRef.current = newAuthState;
      if (pool.current) {
        pool.current.close(); // Close existing connections
        pool.current = undefined; // Force recreation
      }
    }
    
    queryClient.resetQueries();
  }, [config.relayUrl, currentUser?.pubkey, queryClient]);

  // Initialize or recreate NPool when needed
  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        // Create relay with NIP-42 authentication if user is available
        const relayOpts = currentUser?.signer ? {
          auth: createAuthCallback(currentUser, url)
        } : undefined;
        
        return new NRelay1(url, relayOpts);
      },
      reqRouter(filters) {
        return new Map([[relayUrl.current, filters]]);
      },
      eventRouter(_event: NostrEvent) {
        // Publish to the selected relay
        const allRelays = new Set<string>([relayUrl.current]);

        // Also publish to the preset relays, capped to 5
        for (const { url } of (presetRelays ?? [])) {
          allRelays.add(url);

          if (allRelays.size >= 5) {
            break;
          }
        }

        return [...allRelays];
      },
    });
  }

  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
};

export default NostrProvider;