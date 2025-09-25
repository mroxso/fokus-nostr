import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar, Link as LinkIcon } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorEvents } from '@/hooks/useEvents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';

interface UserProfilePageProps {
  pubkey: string;
}

export function UserProfilePage({ pubkey }: UserProfilePageProps) {
  const { data: author, isLoading: authorLoading } = useAuthor(pubkey);
  const { data: events, isLoading: eventsLoading } = useAuthorEvents(pubkey);
  const { user } = useCurrentUser();
  
  const metadata = author?.metadata;
  const displayName = metadata?.name || genUserName(pubkey);
  const username = metadata?.name ? `@${metadata.name}` : genUserName(pubkey);
  const avatar = metadata?.picture;
  const banner = metadata?.banner;
  const bio = metadata?.about;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;
  const isBot = metadata?.bot;
  
  const isOwnProfile = user?.pubkey === pubkey;
  const npub = nip19.npubEncode(pubkey);

  // Calculate join date based on oldest event (approximate)
  const joinDate = events && events.length > 0 
    ? new Date(Math.min(...events.map(e => e.created_at)) * 1000)
    : null;

  useSeoMeta({
    title: `${displayName} - Nostr Social Client`,
    description: bio || `View ${displayName}'s profile and posts on Nostr`,
  });

  if (authorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto py-6 px-4">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-10 w-32 mb-6" />
            <ProfileSkeleton />
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
            {/* Profile Header */}
            <Card>
              {/* Banner */}
              {banner && (
                <div className="h-32 sm:h-48 w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={banner} 
                    alt="Profile banner" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="relative">
                {/* Avatar */}
                <div className={`${banner ? '-mt-16' : ''} mb-4`}>
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback className="text-lg">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      <p className="text-muted-foreground">{username}</p>
                    </div>
                    {isOwnProfile && (
                      <Link to="/edit-profile">
                        <Button variant="outline">Edit Profile</Button>
                      </Link>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {isBot && (
                      <Badge variant="secondary">
                        Bot
                      </Badge>
                    )}
                    {nip05 && (
                      <Badge variant="outline" className="text-xs">
                        ✓ {nip05}
                      </Badge>
                    )}
                  </div>

                  {/* Bio */}
                  {bio && (
                    <p className="text-sm leading-relaxed">{bio}</p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {website && (
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {joinDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDistanceToNow(joinDate, { addSuffix: true })}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <span>
                      <strong>{events?.length || 0}</strong> posts
                    </span>
                    <span className="text-muted-foreground">
                      {npub.slice(0, 16)}...
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Posts */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              {eventsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {isOwnProfile ? "You haven't posted anything yet." : "No posts found."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-20 w-20 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </Card>
  );
}