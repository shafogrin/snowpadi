import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, Clock } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import UserAvatar from "./UserAvatar";
import ReputationDisplay from "./ReputationDisplay";
import UserBadges from "./UserBadges";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    profiles: {
      id: string;
      username: string;
      avatar_seed: string;
      reputation: number;
    };
    categories: {
      name: string;
      slug: string;
      color: string;
    };
    comments?: { count: number }[];
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const commentCount = post.comments?.[0]?.count || 0;

  return (
    <Link to={`/post/${post.id}`}>
      <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="space-y-3 relative">
          <div className="flex items-center gap-3 flex-wrap">
            <CategoryBadge category={post.categories} />
            <div className="flex items-center gap-2 flex-1">
              <UserAvatar seed={post.profiles.avatar_seed} size="sm" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{post.profiles.username}</span>
                <ReputationDisplay reputation={post.profiles.reputation} />
                <UserBadges userId={post.profiles.id} limit={2} />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">{post.title}</h3>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground line-clamp-3 mb-4">{post.content}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PostCard;
