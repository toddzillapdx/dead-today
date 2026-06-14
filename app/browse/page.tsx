// Dead Today — Browse page
// Server component that wraps the BrowsePage client component.

import { LightningBolt } from "@/components/LightningBolt";
import { BrowsePage } from "@/components/BrowsePage";

export const dynamic = "force-dynamic";

export default function BrowseRoute() {
  return (
    <main className="min-h-screen bg-dt-black text-dt-bone px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-dt-6">
        <LightningBolt variant="standalone" fill="#C8102E" size={28} />
        <h1 className="font-display font-bold text-5xl tracking-[0.02em] uppercase">
          Dead Today
        </h1>
      </header>

      <BrowsePage />

      <footer className="text-dt-text-subtle text-xs border-t border-dt pt-dt-6 mt-dt-10">
        <p>
          Dead Today — browse all concerts from the Internet Archive. Powered by
          archive.org.
        </p>
      </footer>
    </main>
  );
}
