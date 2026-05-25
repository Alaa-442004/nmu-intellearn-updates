const rawProctorBase =
  process.env.NEXT_PUBLIC_PROCTOR_BASE_URL || "http://127.0.0.1:5001";

const normalizedProctorBase = rawProctorBase.replace(/\/+$/, "");

export function proctorUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedProctorBase}/${normalizedPath}`;
}
