// Dead Today — /api/metadata/[identifier]
// Source: Data Architecture v0.1 §7. Proxies Archive.org Metadata API.
// Returns: normalized Track[] (MP3-only, sorted disc+track).

import { NextRequest, NextResponse } from "next/server";
import { metadataUrl, normalizeTracks, fetchArchive } from "@/lib/archive";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const { identifier } = await params;
  if (!identifier) {
    return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
  }

  try {
    const res = await fetchArchive(metadataUrl(identifier), {
      headers: { Accept: "application/json" },
      next: { revalidate: 604800 }, // 7 days — track lists rarely change
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = await res.json();
    if (!data || !data.files) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const tracks = normalizeTracks(identifier, data.files);
    return NextResponse.json({
      identifier,
      tracks,
      metadata: data.metadata ?? null,
    });
  } catch {
    // Network failure or 10s timeout — Archive.org is unreachable.
    return NextResponse.json({ error: "archive_unreachable" }, { status: 503 });
  }
}
