const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/nmu-api";

const normalizedApiBase = rawApiBase.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedApiBase}/${normalizedPath}`;
}
