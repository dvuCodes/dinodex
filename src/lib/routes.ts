export type RouteSearchParams = Record<string, string | string[] | undefined>;

export function buildCanonicalDexHref(searchParams: URLSearchParams | RouteSearchParams): string {
  const params = new URLSearchParams();

  if (searchParams instanceof URLSearchParams) {
    return searchParams.size > 0 ? `/?${searchParams.toString()}` : "/";
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    params.set(key, value);
  }

  return params.size > 0 ? `/?${params.toString()}` : "/";
}
