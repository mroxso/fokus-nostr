import { useSeoMeta } from '@unhead/react';
import { Header } from '@/components/Header';
import { GlobalFeed } from '@/components/GlobalFeed';

const Index = () => {
  useSeoMeta({
    title: 'Nostr Social Client',
    description: 'A modern Nostr social client for browsing notes, pictures, and connecting with the decentralized social network.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Global Feed</h2>
            <p className="text-muted-foreground">
              Discover notes and pictures from the Nostr network
            </p>
          </div>
          
          <GlobalFeed />
        </div>
      </main>
      
      {/* Footer with "Vibed with MKStack" link */}
      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <a 
            href="https://soapbox.pub/mkstack" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Vibed by highperfocused with MKStack
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
