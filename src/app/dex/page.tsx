import { redirect } from "next/navigation";
import { buildCanonicalDexHref } from "@/lib/routes";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DexRedirectPage({ searchParams }: PageProps) {
  redirect(buildCanonicalDexHref(await searchParams));
}
