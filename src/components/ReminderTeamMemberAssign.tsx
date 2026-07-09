import { api } from '../utils/api';
import { showToast } from './Toast';
import TeamMemberSelect from './TeamMemberSelect';
import { t } from '../utils/i18n';

type Props = {
  reminderId: string;
  teamMember?: string;
  members: readonly string[];
  onAssigned?: () => void | Promise<void>;
  className?: string;
  compact?: boolean;
};

export default function ReminderTeamMemberAssign({
  reminderId,
  teamMember,
  members,
  onAssigned,
  className = 'mt-3',
  compact = false,
}: Props) {
  const handleChange = async (member: string) => {
    try {
      await api.updateReminder(reminderId, {
        team_member: member.trim() ? member : null,
      });
      await onAssigned?.();
      showToast(
        member.trim()
          ? t('dashboard.teamsToDoReminderAssignedToMember', { member })
          : t('dashboard.teamsToDoReminderAssignmentCleared'),
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to assign reminder', 'error');
    }
  };

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <TeamMemberSelect
        value={teamMember || ''}
        onChange={(member) => void handleChange(member)}
        members={members}
        id={`reminder-assign-${reminderId}`}
        label={t('dashboard.teamsToDoAssignReminder')}
        selectClassName={
          compact
            ? 'w-full max-w-[220px] px-2 py-1.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-sm'
            : 'w-full max-w-xs px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-sm'
        }
      />
    </div>
  );
}
