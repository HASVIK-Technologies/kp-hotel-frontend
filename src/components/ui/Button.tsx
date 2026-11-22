import Link from "next/link";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "light" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide whitespace-nowrap select-none transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
const variants: Record<Variant, string> = {
  primary: "bg-action text-white shadow-[0_6px_18px_-6px_rgb(47_125_79/0.7)] hover:bg-action-dark hover:-translate-y-0.5",
  secondary: "border-[1.5px] border-green text-green bg-transparent hover:bg-green hover:text-white",
  gold: "bg-brass text-ink hover:bg-brass-light hover:-translate-y-0.5",
  ghost: "text-green hover:bg-sand/60",
  light: "border-[1.5px] border-white/70 text-white hover:bg-white hover:text-green",
  danger: "border-[1.5px] border-danger text-danger hover:bg-danger hover:text-white",
};
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-[0.8rem]",
  md: "min-h-11 px-6 text-[0.86rem]",
  lg: "min-h-[3.25rem] px-8 text-[0.92rem]",
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", className, loading, children, disabled, ...p }: Common & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} aria-busy={loading || undefined} {...p}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, ...p }: Common & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...p}>
      {children}
    </Link>
  );
}
