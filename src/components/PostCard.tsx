import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, Clock } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
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
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={post.categories} />
            <span className="text-sm text-muted-foreground">
              by {post.profiles.username}
            </span>
          </div>
          <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 mb-4">{post.content}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
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
