export const TEAM_MEMBERS = ['YONA', 'LEDJANA', 'CAROLINA', 'MILAGROS', 'YUSTI'] as const;
export type TeamMemberName = (typeof TEAM_MEMBERS)[number];

export function isTeamMemberName(value: string): value is TeamMemberName {
  return (TEAM_MEMBERS as readonly string[]).includes(value);
}

export function normalizeTeamMemberName(raw: string | null | undefined): TeamMemberName | undefined {
  const u = String(raw || '').trim().toUpperCase();
  return isTeamMemberName(u) ? u : undefined;
}
