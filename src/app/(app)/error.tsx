"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red" />
        <h2 className="mb-2 text-xl font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="mb-6 text-text-secondary">
          {error.message ?? "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-blurple px-6 py-2.5 text-sm font-medium text-white hover:bg-blurple-hover"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
