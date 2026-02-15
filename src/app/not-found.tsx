import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md text-center">
        <p className="mb-2 text-6xl font-bold text-blurple">404</p>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">
          Page Not Found
        </h2>
        <p className="mb-6 text-text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-blurple px-6 py-2.5 text-sm font-medium text-white hover:bg-blurple-hover"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
