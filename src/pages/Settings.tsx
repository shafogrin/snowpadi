import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface UserPreferences {
  hidden_categories: string[];
  email_notifications: boolean;
  in_app_notifications: boolean;
  notify_on_comment: boolean;
  notify_on_reply: boolean;
  notify_on_popular: boolean;
  feed_algorithm: string;
}

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    hidden_categories: [],
    email_notifications: true,
    in_app_notifications: true,
    notify_on_comment: true,
    notify_on_reply: true,
    notify_on_popular: false,
    feed_algorithm: "latest",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadPreferences(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadPreferences = async (userId: string) => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (categoriesData) setCategories(categoriesData);

      // Load user preferences
      const { data: prefsData, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (prefsData) {
        setPreferences({
          hidden_categories: prefsData.hidden_categories || [],
          email_notifications: prefsData.email_notifications,
          in_app_notifications: prefsData.in_app_notifications,
          notify_on_comment: prefsData.notify_on_comment,
          notify_on_reply: prefsData.notify_on_reply,
          notify_on_popular: prefsData.notify_on_popular,
          feed_algorithm: prefsData.feed_algorithm,
        });
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      toast({
        title: "Error loading preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      hidden_categories: prev.hidden_categories.includes(categoryId)
        ? prev.hidden_categories.filter(id => id !== categoryId)
        : [...prev.hidden_categories, categoryId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          My SnowPadi Settings
        </h1>

        <div className="space-y-6">
          {/* Feed Algorithm */}
          <Card>
            <CardHeader>
              <CardTitle>Feed Preferences</CardTitle>
              <CardDescription>Customize how posts are shown to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feed-algorithm">Feed Algorithm</Label>
                  <Select
                    value={preferences.feed_algorithm}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, feed_algorithm: value }))}
                  >
                    <SelectTrigger id="feed-algorithm" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest Posts</SelectItem>
                      <SelectItem value="popular">Popular Posts</SelectItem>
                      <SelectItem value="recommended">Recommended for You</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Category Preferences</CardTitle>
              <CardDescription>Hide categories you're not interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={category.id}
                      checked={!preferences.hidden_categories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose when and how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show notifications in the app</p>
                  </div>
                  <Switch
                    id="in-app-notifications"
                    checked={preferences.in_app_notifications}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, in_app_notifications: checked }))
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="font-medium text-sm">Notify me when:</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-comment" className="font-normal">
                    Someone comments on my post
                  </Label>
                  <Switch
                    id="notify-comment"
                    checked={preferences.notify_on_comment}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, notify_on_comment: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-reply" className="font-normal">
                    Someone replies to my comment
                  </Label>
                  <Switch
                    id="notify-reply"
                    checked={preferences.notify_on_reply}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, notify_on_reply: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-popular" className="font-normal">
                    My post becomes popular
                  </Label>
                  <Switch
                    id="notify-popular"
                    checked={preferences.notify_on_popular}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, notify_on_popular: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button onClick={savePreferences} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
