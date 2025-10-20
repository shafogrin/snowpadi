import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().trim().min(1, "Content is required").max(10000, "Content must be less than 10,000 characters"),
  category_id: z.string().uuid("Invalid category"),
});
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePostDialog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (data) {
      setCategories(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = postSchema.safeParse({ title, content, category_id: categoryId });
    
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a post",
        variant: "destructive",
      });
      setLoading(false);
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        category_id: categoryId,
        author_id: user.id,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your post has been created",
      });
      setOpen(false);
      setTitle("");
      setContent("");
      setCategoryId("");
      navigate(`/post/${data.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="sm:text-base">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden xs:inline">Create Post</span>
          <span className="xs:hidden">Post</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Create a New Post</DialogTitle>
          <DialogDescription className="text-sm">
            Share your thoughts with the SnowPadi community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">Title</Label>
            <Input
              id="title"
              placeholder="Give your post a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              maxLength={200}
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={6}
              maxLength={10000}
              className="text-sm sm:text-base resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} size="sm">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
