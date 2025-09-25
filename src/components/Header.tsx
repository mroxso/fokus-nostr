import { Link } from 'react-router-dom';
import { RelaySelector } from '@/components/RelaySelector';
import { ComposeDialog } from '@/components/ComposeDialog';
import { PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo area - left side */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            {/* You can replace this with your app logo */}
            <div className="font-bold text-xl">Fokus</div>
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Compose button */}
          <ComposeDialog />

          {/* Relay Selector */}
          <RelaySelector className="w-48" />
        </div>
      </div>
    </header>
  );
}