import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
        {icon || <ShoppingBag className="h-10 w-10 text-gray-400" />}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-warm-muted max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="px-6 py-3 bg-primary-color text-white font-semibold rounded-full hover:bg-primary-color-dark transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
