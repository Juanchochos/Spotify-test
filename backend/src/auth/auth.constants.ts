export const JWT_EXPIRES_IN = '7d';

export function resolveJwtSecret(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (trimmed) return trimmed;
  return 'change-this-secret-in-production';
}
