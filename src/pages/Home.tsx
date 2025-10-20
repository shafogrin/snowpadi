import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import CategoryBadge from "@/components/CategoryBadge";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [feedAlgorithm, setFeedAlgorithm] = useState<string>("latest");
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserPreferences(session.user.id);
      } else {
        fetchData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => loadUserPreferences(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (feedAlgorithm || hiddenCategories.length > 0) {
      fetchData();
    }
  }, [feedAlgorithm, hiddenCategories]);

  const loadUserPreferences = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_preferences")
        .select("feed_algorithm, hidden_categories")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setFeedAlgorithm(data.feed_algorithm || "latest");
        setHiddenCategories(data.hidden_categories || []);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesData) {
        const visibleCategories = categoriesData.filter(
          cat => !hiddenCategories.includes(cat.id)
        );
        setCategories(visibleCategories);
      }

      // Fetch posts with comment counts
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (id, username, avatar_seed, reputation),
          categories (name, slug, color),
          comments (count)
        `)
        .order("created_at", { ascending: false });

      if (postsData) {
        let filteredPosts = postsData;
        
        // Filter by hidden categories
        if (hiddenCategories.length > 0) {
          filteredPosts = filteredPosts.filter(
            post => !hiddenCategories.includes(post.category_id)
          );
        }

        // Apply feed algorithm
        const postsWithCommentCount = filteredPosts.map(post => ({
          ...post,
          comment_count: post.comments?.length || 0
        }));

        let sortedPosts = postsWithCommentCount;
        if (feedAlgorithm === "popular") {
          sortedPosts = [...postsWithCommentCount].sort(
            (a, b) => b.comment_count - a.comment_count
          );
        } else if (feedAlgorithm === "recommended") {
          sortedPosts = [...postsWithCommentCount].sort(
            (a, b) => (b.comment_count + (b.profiles?.reputation || 0)) - 
                     (a.comment_count + (a.profiles?.reputation || 0))
          );
        }

        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/20 border border-primary/20 animate-fade-in">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
          <div className="relative p-8 md:p-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome to SnowPadi
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                A safe, anonymous community for emotional support, knowledge sharing, and togetherness
              </p>
              {user && (
                <div className="animate-scale-in">
                  <CreatePostDialog />
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Categories */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Browse by Category</h2>
            <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 animate-scale-in"
                style={{ 
                  animationDelay: `${0.1 + index * 0.05}s`,
                  animationFillMode: "backwards"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <CategoryBadge category={category} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Posts</h2>
            <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-muted/30">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
                <p className="text-muted-foreground">Be the first to share your thoughts with the community!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-in-up"
                  style={{ 
                    animationDelay: `${0.3 + index * 0.05}s`,
                    animationFillMode: "backwards"
                  }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
