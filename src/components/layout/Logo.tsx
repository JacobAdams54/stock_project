// src/components/layout/Logo.tsx
import React from "react";

export function Logo({ size = "sm", variant = "dark" }: { size?: string; variant?: string }) {
  return (
    <div
      data-testid="mock-logo"
      data-variant={variant}
      data-size={size}
      style={{ color: variant === "dark" ? "white" : "black" }}
    >
      LOGO
    </div>
  );
}

export default Logo;


// This is a test logo to make Jest work