"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArchiveUnavailable } from "@/components/ArchiveUnavailable";

export function ArchiveUnavailablePage() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    router.refresh();
    // Give the refresh a moment before re-enabling the button in case it
    // fails again immediately.
    setTimeout(() => setRetrying(false), 1500);
  };

  return (
    <main className="min-h-screen bg-dt-black text-dt-bone px-6 py-10 max-w-3xl mx-auto flex flex-col items-center justify-center gap-dt-6">
      <ArchiveUnavailable onRetry={handleRetry} retrying={retrying} />
      <Link
        href="/"
        className="text-dt-red hover:opacity-75 transition text-sm uppercase font-display"
      >
        &larr; Back to Today
      </Link>
    </main>
  );
}
