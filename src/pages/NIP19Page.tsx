import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';
import { EventDetailPage } from '@/components/EventDetailPage';
import { UserProfilePage } from '@/components/UserProfilePage';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type, data } = decoded;

  switch (type) {
    case 'npub':
      return <UserProfilePage pubkey={data} />;

    case 'nprofile':
      return <UserProfilePage pubkey={data.pubkey} />;

    case 'note':
      return <EventDetailPage eventId={data} />;

    case 'nevent':
      return <EventDetailPage eventId={data.id} />;

    case 'naddr':
      // For addressable events, we need to construct a detail page
      // For now, we'll treat them similarly to regular events
      return <div>Addressable event placeholder - {data.identifier}</div>;

    default:
      return <NotFound />;
  }
} 