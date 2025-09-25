import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EventDetailPageProps {
  eventId: string;
}

export function EventDetailPage({ eventId }: EventDetailPageProps) {
  const { data: event, isLoading, error } = useEvent(eventId);

  useSeoMeta({
    title: event 
      ? `${event.kind === 20 ? 'Picture' : 'Note'} - Nostr Social Client`
      : 'Loading - Nostr Social Client',
    description: event?.content || 'View this Nostr event and its comments',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto py-6 px-4">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-10 w-32 mb-6" />
            <EventDetailSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto py-6 px-4">
          <div className="max-w-2xl mx-auto">
            <Link to="/">
              <Button variant="ghost" className="gap-2 mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Button>
            </Link>
            <Alert>
              <AlertDescription>
                {error ? 'Failed to load this event.' : 'Event not found.'}
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
          
          <div className="space-y-6">
            <EventCard event={event} showFullContent={true} />
            <CommentsSection root={event} />
          </div>
        </div>
      </main>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3 mb-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-4 pt-4 border-t">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </Card>
  );
}