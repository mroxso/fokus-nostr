import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to fetch a single event by its ID
 */
export function useEvent(eventId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async ({ signal }) => {
      if (!eventId) return null;
      
      const events = await nostr.query([{ ids: [eventId] }], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(3000)])
      });

      return events[0] || null;
    },
    enabled: !!eventId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch events by a specific author
 */
export function useAuthorEvents(pubkey: string, kinds: number[] = [1, 20]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['author-events', pubkey, kinds],
    queryFn: async ({ signal }) => {
      if (!pubkey) return [];
      
      const events = await nostr.query([{ 
        authors: [pubkey], 
        kinds,
        limit: 50 
      }], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(3000)])
      });

      return events.sort((a: NostrEvent, b: NostrEvent) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 60000, // 1 minute
  });
}