import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReportDialog from "./ReportDialog";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    profiles: {
      username: string;
    };
  };
  currentUserId?: string;
  isAdmin: boolean;
  onDelete: () => void;
}

const CommentItem = ({ comment, currentUserId, isAdmin, onDelete }: CommentItemProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const canDelete = currentUserId === comment.author_id || isAdmin;

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Comment deleted",
      });
      onDelete();
    }
    setDeleting(false);
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.profiles.username}</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentUserId && (
              <ReportDialog itemType="comment" itemId={comment.id} />
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
      </CardContent>
    </Card>
  );
};

export default CommentItem;
