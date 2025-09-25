import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FooterNav } from '@/components/FooterNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Outlet />
          
          {/* Attribution footer - above the nav bar */}
          <div className="text-center text-sm text-muted-foreground mt-12 mb-20">
            <a 
              href="https://soapbox.pub/mkstack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Vibed by highperfocused with MKStack
            </a>
          </div>
        </div>
      </main>
      <FooterNav />
    </div>
  );
}