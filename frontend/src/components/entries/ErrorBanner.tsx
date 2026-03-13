import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  title: string;
  message: string;
}

/**
 * A small red alert banner used for API and delete errors.
 */
export default function ErrorBanner({ title, message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl bg-red-50/60 p-4 backdrop-blur-sm"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
      <div className="text-sm text-red-800">
        <p className="font-medium">{title}</p>
        <p>{message}</p>
      </div>
    </div>
  );
}
