import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { ZapButton } from '@/components/ZapButton';
import { useZaps } from '@/hooks/useZaps';
import { useWallet } from '@/hooks/useWallet';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';

interface EventCardProps {
  event: NostrEvent;
  showFullContent?: boolean;
  className?: string;
}

export function EventCard({ event, showFullContent = false, className = '' }: EventCardProps) {
  const { data: author } = useAuthor(event.pubkey);
  const { webln, activeNWC } = useWallet();
  const { totalSats, isLoading: zapLoading } = useZaps([event], webln, activeNWC);
  const [showMore, setShowMore] = useState(showFullContent);
  const isMobile = useIsMobile();

  const metadata = author?.metadata;
  let displayName = metadata?.name || genUserName(event.pubkey);
  let username = metadata?.name ? `@${metadata.name}` : genUserName(event.pubkey);
  const avatar = metadata?.picture;
  const timeAgo = formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true });

  // Generate NIP-19 identifiers for navigation
  const npub = nip19.npubEncode(event.pubkey);
  const noteId = event.kind === 1 ? nip19.noteEncode(event.id) : nip19.neventEncode({
    id: event.id,
    author: event.pubkey,
    kind: event.kind,
  });

  // Check if content should be truncated
  const shouldTruncate = !showFullContent && event.content.length > 280;
  const displayContent = shouldTruncate && !showMore 
    ? event.content.slice(0, 280) + '...' 
    : event.content;

  // Check if display name should be truncated
  const shouldTruncateDisplayName = displayName.length > 15 && isMobile;
  displayName = shouldTruncateDisplayName 
    ? displayName.slice(0, 12) + '...' 
    : displayName;

  // Check if username should be truncated
  const shouldTruncateUsername = username.length > 15 && isMobile;
  username = shouldTruncateUsername 
    ? username.slice(0, 12) + '...' 
    : username;

  // Extract title for Kind 20 events
  const title = event.kind === 20 ? event.tags.find(tag => tag[0] === 'title')?.[1] : undefined;

  // Extract image URLs for Kind 20 events
  const imageUrls = event.kind === 20 
    ? event.tags
        .filter(tag => tag[0] === 'imeta')
        .map(tag => {
          const urlParam = tag.find(param => param.startsWith('url '));
          return urlParam ? urlParam.slice(4) : null;
        })
        .filter((url): url is string => url !== null)
    : [];

  const handleShare = async () => {
    const url = `${window.location.origin}/${noteId}`;
    if (navigator.share) {
      await navigator.share({
        title: event.kind === 20 ? title || 'Picture' : 'Note',
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/${npub}`} className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/${npub}`} className="hover:underline">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{username}</p>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {event.kind === 20 && (
              <Badge variant="secondary" className="text-xs">
                Picture
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link to={`/${noteId}`} className="block">
          {/* Title for Kind 20 events */}
          {title && (
            <h3 className="font-semibold text-lg mb-2 hover:underline">{title}</h3>
          )}

          {/* Content */}
          {displayContent && (
            <div className="mb-4">
              <NoteContent event={{ ...event, content: displayContent }} />
              {shouldTruncate && !showMore && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-muted-foreground hover:text-foreground mt-1"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMore(true);
                  }}
                >
                  Show more
                </Button>
              )}
            </div>
          )}

          {/* Images for Kind 20 events */}
          {event.kind === 20 && imageUrls.length > 0 && (
            <div className="mb-4">
              {imageUrls.length === 1 ? (
                <img 
                  src={imageUrls[0]} 
                  alt={title || 'Image'} 
                  className="w-full rounded-lg max-h-96 object-cover hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Image ${index + 1}`} 
                        className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                      {index === 3 && imageUrls.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold">+{imageUrls.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Link>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Link to={`/${noteId}`}>
              <Button variant="ghost" size="sm" className="text-xs gap-1 px-2 h-8">
                <MessageCircle className="h-4 w-4" />
                <span>Reply</span>
              </Button>
            </Link>
            
            <ZapButton 
              target={event} 
              showCount={true}
              zapData={{
                count: 0, // We don't track count separately, just total sats
                totalSats,
                isLoading: zapLoading
              }}
              className="text-xs gap-1 px-2 h-8"
            />
            
            <Button variant="ghost" size="sm" className="text-xs gap-1 px-2 h-8" onClick={handleShare}>
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}