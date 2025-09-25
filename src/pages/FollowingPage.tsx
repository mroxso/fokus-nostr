import { useSeoMeta } from '@unhead/react';
import { FollowingFeed } from '@/components/FollowingFeed';

const FollowingPage = () => {
  useSeoMeta({
    title: 'Following - Nostr Social Client',
    description: 'View posts from people you follow on the Nostr social network.',
  });

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Following</h2>
        <p className="text-muted-foreground">
          Posts from people you follow
        </p>
      </div>
      
      <FollowingFeed />
    </>
  );
};

export default FollowingPage;