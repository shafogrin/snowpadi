import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import CategoryBadge from "@/components/CategoryBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (categoriesData) {
      setCategories(categoriesData);
    }

    // Fetch posts with comment counts
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (username),
        categories (name, slug, color),
        comments (count)
      `)
      .order("created_at", { ascending: false });

    if (postsData) {
      setPosts(postsData);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 p-8 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border">
          <h1 className="text-4xl font-bold mb-2">Welcome to SnowPadi</h1>
          <p className="text-lg text-muted-foreground mb-4">
            A safe, anonymous community for emotional support, knowledge sharing, and togetherness
          </p>
          {user && <CreatePostDialog />}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="transition-transform hover:scale-105"
              >
                <CategoryBadge category={category} />
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Latest Posts</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
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

export default Home;
