import { redirect } from "next/navigation";

// ─── /genre/[id] — Legacy redirect ───────────────────────────────────────────
// Genre results have moved to /results?genre=<id>&name=<name>
// This page just redirects so old links still work.
// ──────────────────────────────────────────────────────────────────────────────

interface PageParams {
  id: string;
}

export default async function GenreLegacyPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { id }   = await params;
  const { name } = await searchParams;
  const encoded  = name ? `&name=${encodeURIComponent(name)}` : "";
  redirect(`/results?genre=${id}${encoded}`);
}
