import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link 
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md transition-colors",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export function Navigation() {
  const { user } = useCurrentUser();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const navItems = [
    {
      href: '/',
      icon: <Home className="h-4 w-4" />,
      label: 'Home',
      isActive: location.pathname === '/'
    },
    {
      href: '/following',
      icon: <Users className="h-4 w-4" />,
      label: 'Following',
      isActive: location.pathname === '/following',
      requiresAuth: true
    }
  ];

  // Filter items that require authentication if user is not logged in
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

  if (isMobile) {
    return (
      <div className="bg-background border-b">
        <div className="container flex justify-between py-2">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 top-[56px] z-50 bg-background animate-in slide-in-from-top">
              <div className="container py-4 space-y-2">
                {filteredNavItems.map((item, index) => (
                  <NavItem 
                    key={index}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={item.isActive}
                    onClick={closeMenu}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <nav className="hidden md:flex space-x-2">
      {filteredNavItems.map((item, index) => (
        <NavItem 
          key={index}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
        />
      ))}
    </nav>
  );
}