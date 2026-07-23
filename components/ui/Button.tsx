import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

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
    "bg-linear-to-r from-accent to-accent-2 text-hero-bg hover:brightness-110",
  outline:
    "border border-white/15 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10",
};

const baseClasses =
  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";

export function Button({ variant = "solid", icon, children, className, ...props }: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className ?? ""}`;

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
