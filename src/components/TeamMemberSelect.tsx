type Props = {
  value: string;
  onChange: (value: string) => void;
  members: readonly string[];
  id?: string;
  label?: string;
  className?: string;
  selectClassName?: string;
};

export default function TeamMemberSelect({
  value,
  onChange,
  members,
  id = 'team-member',
  label = 'Team member',
  className = '',
  selectClassName = '',
}: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          selectClassName ||
          'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white'
        }
      >
        <option value="">—</option>
        {members.map((member) => (
          <option key={member} value={member}>
            {member}
          </option>
        ))}
      </select>
    </div>
  );
}
