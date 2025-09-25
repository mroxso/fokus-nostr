import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { EventCard } from '@/components/EventCard';
import { useFollowingFeed } from '@/hooks/useFollowingFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { RelaySelector } from '@/components/RelaySelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { useNavigate } from 'react-router-dom';

export function FollowingFeed() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  // Redirect to home if not logged in
  useEffect(() => {
    if (user === null) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
    isLoadingFollowing,
    followingError,
    followingList,
  } = useFollowingFeed();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Auto-load next page when intersection is triggered
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flat() || [];

  // Not logged in state
  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Login to see posts from people you follow</h3>
          <div className="max-w-sm mx-auto">
            <LoginArea className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state for the following list
  if (isLoadingFollowing || isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error fetching following list
  if (followingError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Alert className="mb-4">
            <AlertDescription>
              Failed to load your contacts. Please check your connection and try again.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            {isRefetching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error fetching posts
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Alert className="mb-4">
            <AlertDescription>
              Failed to load posts. Please check your connection and try again.
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <Button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="gap-2"
            >
              {isRefetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Try Again
            </Button>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Or try switching to a different relay:
              </p>
              <RelaySelector className="w-full max-w-sm mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No one to follow
  if (followingList.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">You're not following anyone yet</h3>
          <p className="text-muted-foreground mb-4">
            When you follow people, their posts will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No posts from following
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-4">
            People you follow haven't posted anything yet, or try switching to a different relay to discover their content.
          </p>
          <RelaySelector className="w-full max-w-sm mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((event, index) => (
        <EventCard
          key={`${event.id}-${index}`}
          event={event}
        />
      ))}

      {/* Loading trigger */}
      <div ref={ref} className="h-10">
        {isFetchingNextPage && (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        )}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You've reached the end! Try switching relays to discover more content.
            </p>
            <RelaySelector className="w-full max-w-sm mx-auto mt-3" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-4 mt-4 pt-2 border-t">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  );
}