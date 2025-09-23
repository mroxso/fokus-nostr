import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RelaySelector } from '@/components/RelaySelector';
import { LoginArea } from '@/components/auth/LoginArea';
import { ComposeDialog } from '@/components/ComposeDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { nip19 } from 'nostr-tools';
import { Settings, Edit, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLoginActions } from '@/hooks/useLoginActions';

export function Header() {
  const { user, metadata } = useCurrentUser();
  const { logout } = useLoginActions();

  const displayName = metadata?.name || (user ? genUserName(user.pubkey) : '');
  const avatar = metadata?.picture;
  const npub = user ? nip19.npubEncode(user.pubkey) : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Nostr Social</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Compose button for logged in users */}
          {user && (
            <ComposeDialog />
          )}
          
          {/* Relay Selector */}
          <RelaySelector className="w-48 hidden sm:flex" />
          
          {/* Auth Area */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {npub.slice(0, 16)}...
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${npub}`} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/edit-profile" className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginArea className="w-auto" />
          )}
        </div>
      </div>
      
      {/* Mobile relay selector */}
      <div className="container sm:hidden pb-2">
        <RelaySelector className="w-full" />
      </div>
    </header>
  );
}