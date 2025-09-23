import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to fetch a global feed of Kind 1 (text notes) and Kind 20 (pictures) events
 * with infinite scroll pagination
 */
export function useGlobalFeed() {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['global-feed'],
    queryFn: async ({ pageParam, signal }) => {
      const filter: { kinds: number[]; limit: number; until?: number } = { 
        kinds: [1, 20], 
        limit: 20 
      };
      
      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(3000)])
      });

      // Sort by created_at descending to ensure proper order
      return events.sort((a: NostrEvent, b: NostrEvent) => b.created_at - a.created_at);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].created_at - 1;
    },
    initialPageParam: undefined,
    staleTime: 30000, // 30 seconds
  });
}