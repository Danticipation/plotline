import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "ink" | "clay";

export function Button({
  variant = "ghost",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:opacity-50",
        variant === "primary" && "bg-moss text-paper hover:bg-moss-deep",
        variant === "ghost" && "border border-line bg-paper text-ink hover:border-ink",
        variant === "ink" && "bg-ink text-paper",
        variant === "clay" && "border border-clay bg-paper text-clay",
        className,
      )}
      {...props}
    />
  );
}
