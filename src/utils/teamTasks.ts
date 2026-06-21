export interface TeamMemberTask {
  id: string;
  title: string;
  notes: string;
  done: boolean;
  createdAt: string;
}

export function emptyTeamTasksMap(members: readonly string[] = []): Record<string, TeamMemberTask[]> {
  const map: Record<string, TeamMemberTask[]> = {};
  for (const member of members) {
    map[member] = [];
  }
  return map;
}

export function groupTeamTasksFromApi(
  rows: Array<{
    id: string;
    teamMember: string;
    title: string;
    notes?: string;
    done: boolean;
    createdAt: string;
  }>,
  members: readonly string[]
): Record<string, TeamMemberTask[]> {
  const empty = emptyTeamTasksMap(members);
  const allowed = new Set(members);
  for (const row of rows) {
    const m = String(row.teamMember || '').toUpperCase();
    if (!allowed.has(m)) continue;
    empty[m].push({
      id: row.id,
      title: row.title,
      notes: typeof row.notes === 'string' ? row.notes : '',
      done: !!row.done,
      createdAt: row.createdAt,
    });
  }
  return empty;
}
