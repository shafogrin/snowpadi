import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserBadgesProps {
  userId: string;
  limit?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

const UserBadges = ({ userId, limit = 3 }: UserBadgesProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from("user_badges")
      .select(`
        earned_at,
        badges (
          id,
          name,
          description,
          icon
        )
      `)
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(limit);

    if (data) {
      const formattedBadges = data.map((item: any) => ({
        ...item.badges,
        earned_at: item.earned_at,
      }));
      setBadges(formattedBadges);
    }
    setLoading(false);
  };

  if (loading || badges.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {badges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <span className="text-lg cursor-help hover:scale-110 transition-transform">
                {badge.icon}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{badge.name}</p>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default UserBadges;
