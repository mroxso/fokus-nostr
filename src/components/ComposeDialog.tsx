import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { PenSquare, Loader2 } from 'lucide-react';
import { LoginArea } from '@/components/auth/LoginArea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';

interface ComposeDialogProps {
  onSuccess?: () => void;
}

export function ComposeDialog({ onSuccess }: ComposeDialogProps) {
  const { user, metadata } = useCurrentUser();
  const { mutateAsync: publishEvent, isPending } = useNostrPublish();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const displayName = metadata?.name || (user ? genUserName(user.pubkey) : '');
  const avatar = metadata?.picture;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your post.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await publishEvent({
        kind: 1,
        content: content.trim(),
      });

      toast({
        title: 'Success',
        description: 'Your post has been published!',
      });

      setContent('');
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish your post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenSquare className="h-5 w-5" />
            Create a Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sign in to share your thoughts with the Nostr network.
          </p>
          <LoginArea className="flex justify-center" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PenSquare className="h-4 w-4" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the Nostr network.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Author info */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{displayName}</span>
          </div>

          {/* Content input */}
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
            disabled={isPending}
          />
          
          {/* Character count */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length}/500 characters
            </span>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !content.trim()}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}