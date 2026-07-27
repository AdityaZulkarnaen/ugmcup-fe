import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge"; 

type ButtonVariant = "solid" | "outline";

interface BaseProps {
  variant?: ButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
}

type ButtonAsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonProps = ButtonAsAnchor | ButtonAsButton;

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "border-[1.5px] border-white bg-[#02F5D4] bg-[radial-gradient(circle_at_50%_50%,#02F5D4_0%,rgba(53,41,128,0)_25%)] text-[#12102A] shadow-[0_79.5px_22.5px_rgba(16,0,51,0.01),inset_0_0_18px_rgba(255,255,255,0.08),inset_0_-12px_48px_rgba(2,245,212,0.5)] hover:brightness-105",
  outline:
    "border border-white/50 bg-linear-to-b from-[#8B5CF6]/[0.03] to-transparent text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.08),inset_0_-8px_32px_rgba(30,13,73,0.5)] hover:from-[#8B5CF6]/[0.08]",
};

const baseClasses =
  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors";

export function Button({ variant = "solid", icon, children, className, ...props }: ButtonProps) {
  const classes = twMerge(baseClasses, variantClasses[variant], className);

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props as ButtonAsAnchor;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
        {icon}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
      {icon}
    </button>
  );
}
