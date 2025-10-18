import { Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReputationDisplayProps {
  reputation: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const ReputationDisplay = ({ 
  reputation, 
  size = "sm", 
  showLabel = false 
}: ReputationDisplayProps) => {
  const getLevel = (rep: number) => {
    if (rep >= 100) return { name: "Community Leader", color: "text-yellow-500" };
    if (rep >= 50) return { name: "Rising Star", color: "text-purple-500" };
    if (rep >= 25) return { name: "Active Padi", color: "text-blue-500" };
    if (rep >= 10) return { name: "Contributor", color: "text-green-500" };
    return { name: "New Padi", color: "text-muted-foreground" };
  };

  const level = getLevel(reputation);
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <Award className={`${iconSize} ${level.color}`} />
            <span className={`font-medium ${level.color} ${size === "sm" ? "text-sm" : "text-base"}`}>
              {reputation}
            </span>
            {showLabel && (
              <span className="text-xs text-muted-foreground ml-1">
                {level.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{level.name}</p>
          <p className="text-sm text-muted-foreground">
            {reputation} reputation points
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Earn points by posting (+5) and commenting (+2)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ReputationDisplay;
