import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-mono uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "border-none bg-azure text-white shadow-[0_10px_24px_-10px_rgba(47,93,143,0.9)] hover:bg-azure-bright hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-12px_rgba(47,93,143,0.95)] active:translate-y-0",
        glass: "glass text-paper-dim hover:text-azure hover:-translate-y-0.5",
        quiet:
          "border border-line text-paper-dim hover:border-azure hover:text-azure hover:-translate-y-0.5",
      },
      size: {
        sm: "px-5 py-2.5 text-[11px]",
        md: "px-8 py-4 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children: React.ReactNode;
  /** Adds a corner arrow that slides on hover — for calls to action, not form submits. */
  withArrow?: boolean;
};

type ButtonProps = ButtonBaseProps &
  (
    | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  );

/**
 * Renders an anchor when given `href`, otherwise a real button, so navigation
 * and form actions share one set of pill styles.
 */
export function Button({ variant, size, className, children, withArrow, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const content = (
    <>
      {children}
      {withArrow && (
        <ArrowUpRight
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
        />
      )}
    </>
  );

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props as { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
