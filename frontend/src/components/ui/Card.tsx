import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  glow?: boolean;
};

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  hover = false,
  padding = "md",
  glow = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`surface rounded-[var(--radius-xl)] ${
        hover ? "surface-interactive cursor-default" : ""
      } ${glow ? "glow-subtle" : ""} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
