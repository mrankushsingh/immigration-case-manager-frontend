import { TEAM_MEMBERS, TeamMemberName } from './teamMembers';

export interface TeamMemberTask {
  id: string;
  title: string;
  notes: string;
  done: boolean;
  createdAt: string;
}

export function emptyTeamTasksMap(): Record<TeamMemberName, TeamMemberTask[]> {
  return {
    YONA: [],
    LEDJANA: [],
    CAROLINA: [],
    MILAGROS: [],
    YUSTI: [],
  };
}

export function groupTeamTasksFromApi(
  rows: Array<{
    id: string;
    teamMember: string;
    title: string;
    notes?: string;
    done: boolean;
    createdAt: string;
  }>
): Record<TeamMemberName, TeamMemberTask[]> {
  const empty = emptyTeamTasksMap();
  for (const row of rows) {
    const m = String(row.teamMember || '').toUpperCase();
    if (!(TEAM_MEMBERS as readonly string[]).includes(m)) continue;
    const name = m as TeamMemberName;
    empty[name].push({
      id: row.id,
      title: row.title,
      notes: typeof row.notes === 'string' ? row.notes : '',
      done: !!row.done,
      createdAt: row.createdAt,
    });
  }
  return empty;
}
