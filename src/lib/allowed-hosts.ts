/** Hosts permitidos (sem protocolo) — Server Actions e CSRF. */
export const ALLOWED_HOSTS = [
  "localhost:3000",
  "efatechpro.com.br",
  "www.efatechpro.com.br",
  "74ca45c6-fa8a-4584-8723-09939e8e1666.preview.emergentagent.com",
  "74ca45c6-fa8a-4584-8723-09939e8e1666.cluster-0.preview.emergentcf.cloud",
] as const;

export function getAllowedHostsForConfig(): string[] {
  const hosts = new Set<string>(ALLOWED_HOSTS);
  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (vercel) hosts.add(vercel);
  return [...hosts];
}
