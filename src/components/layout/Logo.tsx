import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export const Logo = ({ size = "md", variant = "light" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-16",
    md: "h-28",
    lg: "h-35",
  };

  return (
    <img
      src="/logo.png"
      alt="STALK.AI logo"
      className={sizeClasses[size]}
      data-testid="mock-logo"
      data-variant={variant}
      data-size={size}
    />
  );
};
