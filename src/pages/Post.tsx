import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import CommentItem from "@/components/CommentItem";
import ReportDialog from "@/components/ReportDialog";
import UserAvatar from "@/components/UserAvatar";
import ReputationDisplay from "@/components/ReputationDisplay";
import UserBadges from "@/components/UserBadges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000, "Comment must be less than 2,000 characters"),
});
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [id]);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (id, username, avatar_seed, reputation),
        categories (name, slug, color)
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Post not found",
        variant: "destructive",
      });
      navigate("/");
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles (id, username, avatar_seed, reputation)
      `)
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (data) {
      setComments(data);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = commentSchema.safeParse({ content: newComment });
    
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to comment",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("comments")
      .insert({
        content: newComment.trim(),
        post_id: id,
        author_id: user.id,
      });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Comment posted",
      });
      setNewComment("");
      fetchComments();
    }
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      setDeleting(false);
    } else {
      toast({
        title: "Success",
        description: "Post deleted",
      });
      navigate("/");
    }
  };

  const canDeletePost = user && (user.id === post?.profiles?.id || isAdmin);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-8">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap flex-1">
                <CategoryBadge category={post.categories} />
                <div className="flex items-center gap-2">
                  <UserAvatar seed={post.profiles.avatar_seed} size="sm" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-medium">{post.profiles.username}</span>
                    <div className="flex items-center gap-2">
                      <ReputationDisplay reputation={post.profiles.reputation} size="sm" />
                      <UserBadges userId={post.profiles.id} limit={2} />
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && <ReportDialog itemType="post" itemId={post.id} />}
                {canDeletePost && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={deleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap text-lg">{post.content}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Comments ({comments.length})</h2>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                rows={4}
                maxLength={2000}
              />
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Comment
              </Button>
            </form>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to join the discussion
                </p>
                <Button onClick={() => navigate("/auth")}>Sign In</Button>
              </CardContent>
            </Card>
          )}

          {comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                  onDelete={fetchComments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
