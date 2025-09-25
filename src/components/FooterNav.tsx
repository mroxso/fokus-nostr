import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, Users } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import LoginDialog from '@/components/auth/LoginDialog';
import { nip19 } from 'nostr-tools';

export function FooterNav() {
  const { user, metadata } = useCurrentUser();
  const location = useLocation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const displayName = metadata?.name || (user ? genUserName(user.pubkey) : '');
  const avatar = metadata?.picture;
  const npub = user ? nip19.npubEncode(user.pubkey) : '';

  // Define the nav items
  const navItems = [
    {
      href: '/',
      icon: <Home className="h-6 w-6" />,
      label: 'Home',
      isActive: location.pathname === '/'
    },
    // {
    //   href: '/',
    //   icon: <Globe className="h-6 w-6" />,
    //   label: 'Global',
    //   isActive: location.pathname === '/'
    // },
    {
      href: '/following',
      icon: <Users className="h-6 w-6" />,
      label: 'Following',
      isActive: location.pathname === '/following',
      requiresAuth: true
    },
  ];

  // Filter items that require authentication if user is not logged in
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex justify-around items-center h-16 px-4">
      {filteredNavItems.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          className={cn(
            "flex flex-col items-center justify-center p-2",
            item.isActive
              ? "text-primary"
              : "text-muted-foreground"
          )}
          aria-label={item.label}
        >
          {item.icon}
        </Link>
      ))}

      {user ? (
        <Link
          to={`/${npub}`}
          className={cn(
            "flex flex-col items-center justify-center",
            location.pathname === `/${npub}`
              ? "text-primary"
              : "text-muted-foreground"
          )}
          aria-label="Profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <>
          {/* Login button for non-logged in users */}
          <Button 
            variant="ghost" 
            onClick={() => setLoginDialogOpen(true)}
            className="flex flex-col items-center justify-center p-0"
            aria-label="Sign In"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </Button>
          
          {/* Login dialog */}
          <LoginDialog 
            isOpen={loginDialogOpen} 
            onClose={() => setLoginDialogOpen(false)}
            onLogin={() => setLoginDialogOpen(false)}
          />
        </>
      )}
    </nav>
  );
}