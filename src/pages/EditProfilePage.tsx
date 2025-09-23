import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EditProfileForm } from '@/components/EditProfileForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EditProfilePage() {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Edit Profile - Nostr Social Client',
    description: 'Edit your Nostr profile information',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">
              Update your public profile information
            </p>
          </div>

          {user ? (
            <EditProfileForm />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Login Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to edit your profile.
                </p>
                <LoginArea className="flex justify-center" />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}