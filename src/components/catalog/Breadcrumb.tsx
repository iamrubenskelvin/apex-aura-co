import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Você está aqui"
      className="mx-auto max-w-7xl overflow-x-auto px-5 py-5 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex w-max items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            {item.to && i < items.length - 1 ? (
              <Link
                to={item.to}
                params={item.params ?? {}}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-semibold text-foreground" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
