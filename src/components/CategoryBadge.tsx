import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category: {
    name: string;
    slug: string;
    color: string;
  };
}

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  return (
    <Badge
      variant="secondary"
      style={{
        backgroundColor: `${category.color}15`,
        color: category.color,
        borderColor: `${category.color}30`,
      }}
      className="border"
    >
      {category.name}
    </Badge>
  );
};

export default CategoryBadge;
