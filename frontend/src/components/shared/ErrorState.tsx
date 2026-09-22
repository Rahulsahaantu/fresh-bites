import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-warm-muted max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary-color text-white font-semibold rounded-full hover:bg-primary-color-dark transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
