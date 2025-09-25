import { useSeoMeta } from '@unhead/react';
import { GlobalFeed } from '@/components/GlobalFeed';

const Index = () => {
  useSeoMeta({
    title: 'Nostr Social Client',
    description: 'A modern Nostr social client for browsing notes, pictures, and connecting with the decentralized social network.',
  });

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Global Feed</h2>
        <p className="text-muted-foreground">
          Discover notes and pictures from the Nostr network
        </p>
      </div>
      
      <GlobalFeed />
    </>
  );
};

export default Index;
