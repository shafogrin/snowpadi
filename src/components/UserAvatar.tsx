interface UserAvatarProps {
  seed: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar = ({ seed, size = "md", className = "" }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  // Generate a deterministic color from seed
  const generateColor = (str: string, index: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = (Math.abs(hash) + index * 137) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const color1 = generateColor(seed, 0);
  const color2 = generateColor(seed, 1);
  const color3 = generateColor(seed, 2);

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center overflow-hidden relative ring-2 ring-border`}
      style={{
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="40" r="15" fill={color3} opacity="0.7" />
        <circle cx="30" cy="65" r="12" fill={color1} opacity="0.5" />
        <circle cx="70" cy="70" r="10" fill={color2} opacity="0.6" />
      </svg>
    </div>
  );
};

export default UserAvatar;
