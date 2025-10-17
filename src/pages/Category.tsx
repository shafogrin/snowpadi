import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import CategoryBadge from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const Category = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchCategory();
    fetchPosts();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [slug]);

  const fetchCategory = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) {
      setCategory(data);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (categoryData) {
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (username),
          categories (name, slug, color),
          comments (count)
        `)
        .eq("category_id", categoryData.id)
        .order("created_at", { ascending: false });

      if (postsData) {
        setPosts(postsData);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {category && (
          <div className="mb-8 p-8 rounded-lg border" style={{
            backgroundColor: `${category.color}10`,
            borderColor: `${category.color}30`,
          }}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <CategoryBadge category={category} />
                <h1 className="text-3xl font-bold mt-3">{category.name}</h1>
                <p className="text-muted-foreground mt-2">{category.description}</p>
              </div>
              {user && <CreatePostDialog />}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Posts in {category?.name || "Category"}
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No posts in this category yet. Be the first to share!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
