export const DEFAULT_TEAM_MEMBERS = ['YONA', 'LEDJANA', 'CAROLINA', 'MILAGROS', 'YUSTI'] as const;

export type TeamMemberName = string;

export function isTeamMemberName(value: string, members: readonly string[]): boolean {
  const u = String(value || '').trim().toUpperCase();
  return members.includes(u);
}

export function normalizeTeamMemberName(
  raw: string | null | undefined,
  members?: readonly string[]
): string | undefined {
  const u = String(raw || '').trim().toUpperCase();
  if (!u) return undefined;
  if (members) return members.includes(u) ? u : undefined;
  return u;
}

export function validateMemberNameInput(raw: string): string | null {
  const name = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  if (!name || name.length > 50) return null;
  if (!/^[A-Z0-9][A-Z0-9\s'.-]*$/.test(name)) return null;
  return name;
}
