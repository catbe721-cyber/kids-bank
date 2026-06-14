import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={16} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
