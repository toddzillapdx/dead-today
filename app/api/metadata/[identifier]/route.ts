// Dead Today — /api/metadata/[identifier]
// Source: Data Architecture v0.1 §7. Proxies Archive.org Metadata API.
// Returns: normalized Track[] (MP3-only, sorted disc+track).

import { NextRequest, NextResponse } from "next/server";
import { metadataUrl, normalizeTracks } from "@/lib/archive";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { identifier: string } },
) {
  const { identifier } = params;
  if (!identifier) {
    return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
  }

  try {
    const res = await fetch(metadataUrl(identifier), {
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
