import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { EventCard } from '@/components/EventCard';
import { useGlobalFeed } from '@/hooks/useGlobalFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { RelaySelector } from '@/components/RelaySelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GlobalFeed() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useGlobalFeed();
  
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

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

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-4">
            Try switching to a different relay to discover content.
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