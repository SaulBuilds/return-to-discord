"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* Logo / Hero */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blurple">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-text-primary">
            Return to Discord
          </h1>
          <p className="text-lg leading-relaxed text-text-secondary">
            Find your friends across Discord and Twitter. Match linked accounts,
            discover shared servers, and reconnect with people you already know.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-5">
            <div className="mb-2 text-2xl">🔗</div>
            <h3 className="mb-1 font-semibold text-text-primary">
              Link Accounts
            </h3>
            <p className="text-sm text-text-secondary">
              Connect your Discord and Twitter to start matching.
            </p>
          </div>
          <div className="rounded-xl bg-surface p-5">
            <div className="mb-2 text-2xl">🔍</div>
            <h3 className="mb-1 font-semibold text-text-primary">
              Discover Friends
            </h3>
            <p className="text-sm text-text-secondary">
              Find people from shared servers and mutual follows.
            </p>
          </div>
          <div className="rounded-xl bg-surface p-5">
            <div className="mb-2 text-2xl">💬</div>
            <h3 className="mb-1 font-semibold text-text-primary">
              Connect & Chat
            </h3>
            <p className="text-sm text-text-secondary">
              Add friends and message them directly in the app.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={login}
          disabled={!ready}
          className="rounded-xl bg-blurple px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blurple-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ready ? "Sign In to Get Started" : "Loading..."}
        </button>

        <p className="mt-6 text-sm text-text-muted">
          Sign in with email, Google, Discord, or Twitter
        </p>
      </div>
    </div>
  );
}
