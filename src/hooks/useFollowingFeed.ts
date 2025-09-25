import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useEffect, useState } from 'react';

/**
 * Hook to fetch a feed of Kind 1 (text notes) and Kind 20 (pictures) events
 * from users that the logged-in user follows (from their kind 3 contact list)
 */
export function useFollowingFeed() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [followingError, setFollowingError] = useState<Error | null>(null);

  // Fetch the user's following list (kind 3 contact list)
  useEffect(() => {
    if (!user) {
      setFollowingList([]);
      return;
    }

    const fetchFollowingList = async () => {
      setIsLoadingFollowing(true);
      try {
        // Get the most recent kind 3 event from the user
        const contactEvents = await nostr.query(
          [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
          { signal: AbortSignal.timeout(5000) }
        );

        if (contactEvents.length > 0) {
          // Extract pubkeys from p tags
          const contactList = contactEvents[0].tags
            .filter(tag => tag[0] === 'p' && tag[1])
            .map(tag => tag[1]);
          setFollowingList(contactList);
        } else {
          // If no contact list found, set empty array
          setFollowingList([]);
        }
      } catch (error) {
        console.error('Failed to fetch following list:', error);
        setFollowingError(error instanceof Error ? error : new Error(String(error)));
        setFollowingList([]);
      } finally {
        setIsLoadingFollowing(false);
      }
    };

    fetchFollowingList();
  }, [nostr, user]);

  // Use the following list to fetch posts from those users
  const postsQuery = useInfiniteQuery({
    queryKey: ['following-feed', followingList],
    queryFn: async ({ pageParam, signal }) => {
      // If not logged in or no following list, return empty
      if (!user || followingList.length === 0) {
        return [];
      }

      const filter: { kinds: number[]; authors: string[]; limit: number; until?: number } = {
        kinds: [1, 20], // text notes and pictures
        authors: followingList,
        limit: 20,
      };

      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)])
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
    enabled: user !== null && followingList.length > 0,
  });

  return {
    ...postsQuery,
    isLoadingFollowing,
    followingError,
    followingList,
  };
}