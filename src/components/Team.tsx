import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Eye,
  FileText,
  ListTodo,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { api } from '../utils/api';
import { CaseTemplate, Client } from '../types';
import { t } from '../utils/i18n';
import { showToast } from './Toast';
import ClientDetailsModal from './ClientDetailsModal';
import { useData } from '../context/DataContext';
import { TEAM_MEMBERS, TeamMemberName, normalizeTeamMemberName } from '../utils/teamMembers';
import {
  TeamMemberTask,
  emptyTeamTasksMap,
  groupTeamTasksFromApi,
} from '../utils/teamTasks';

function TeamClientCard({
  client,
  onClick,
  compact = false,
}: {
  client: Client;
  onClick: () => void;
  compact?: boolean;
}) {
  const submittedCount = client.required_documents?.filter((d) => d.submitted).length || 0;
  const totalDocs = client.required_documents?.length || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left glass-gold rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white hover:border-amber-400 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-amber-900 truncate ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
            {client.first_name} {client.last_name}
          </h3>
          <p className={`text-amber-700/70 font-medium truncate ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
            {client.case_type || t('clients.noTemplate')}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-2 rounded-lg shadow-sm shrink-0">
          <Users className={`text-amber-800 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
      </div>
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${compact ? 'text-xs' : 'text-sm'} pt-2 border-t border-amber-200/50`}>
        <span className="text-amber-700/80">
          {t('clients.documents')}:{' '}
          <span className="font-bold text-amber-900">
            {submittedCount}/{totalDocs}
          </span>
        </span>
        {client.submitted_to_immigration ? (
          <span className="text-green-700 font-semibold">{t('dashboard.teamsToDoSubmitted')}</span>
        ) : null}
      </div>
    </button>
  );
}

export default function Team() {
  const { clients, templates, refreshClients, refreshTemplates } = useData();
  const [teamTasksByMember, setTeamTasksByMember] = useState(emptyTeamTasksMap);
  const [teamTasksLoading, setTeamTasksLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMemberName | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates'>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormNotes, setTaskFormNotes] = useState('');
  const [taskView, setTaskView] = useState<TeamMemberTask | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [templateAssignLoadingId, setTemplateAssignLoadingId] = useState<string | null>(null);

  const fetchTeamTasks = useCallback(async () => {
    try {
      setTeamTasksLoading(true);
      const rows = await api.getTeamTasks();
      setTeamTasksByMember(groupTeamTasksFromApi(rows));
    } catch (error: any) {
      showToast(error.message || 'Failed to load team tasks', 'error');
    } finally {
      setTeamTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTeamTasks();
  }, [fetchTeamTasks]);

  const clientsByTemplateId = useMemo(() => {
    const map: Record<string, Client[]> = {};
    for (const client of clients) {
      if (!client.case_template_id) continue;
      if (!map[client.case_template_id]) map[client.case_template_id] = [];
      map[client.case_template_id].push(client);
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      );
    }
    return map;
  }, [clients]);

  const memberTemplateSummary = useMemo(() => {
    const summary = {} as Record<TeamMemberName, { templates: CaseTemplate[]; clientCount: number }>;
    for (const member of TEAM_MEMBERS) {
      const memberTemplates = templates.filter(
        (tpl) => normalizeTeamMemberName(tpl.assigned_team_member) === member
      );
      const clientCount = memberTemplates.reduce(
        (sum, tpl) => sum + (clientsByTemplateId[tpl.id]?.length || 0),
        0
      );
      summary[member] = { templates: memberTemplates, clientCount };
    }
    return summary;
  }, [templates, clientsByTemplateId]);

  const memberClients = useMemo(() => {
    if (!selectedMember) return [];
    const memberTemplates = memberTemplateSummary[selectedMember]?.templates || [];
    const seen = new Set<string>();
    const list: Client[] = [];
    for (const tpl of memberTemplates) {
      for (const client of clientsByTemplateId[tpl.id] || []) {
        if (seen.has(client.id)) continue;
        seen.add(client.id);
        list.push(client);
      }
    }
    return list.sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    );
  }, [selectedMember, memberTemplateSummary, clientsByTemplateId]);

  const resetMemberDetail = useCallback(() => {
    setSelectedMember(null);
    setShowTaskForm(false);
    setTaskFormTitle('');
    setTaskFormNotes('');
    setTaskView(null);
    setActiveTab('tasks');
  }, []);

  const openMember = useCallback((name: TeamMemberName) => {
    setSelectedMember(name);
    setActiveTab('tasks');
    setShowTaskForm(false);
    setTaskFormTitle('');
    setTaskFormNotes('');
    setTaskView(null);
  }, []);

  const toggleTemplateAssignment = useCallback(
    async (template: CaseTemplate, assign: boolean) => {
      if (!selectedMember) return;
      setTemplateAssignLoadingId(template.id);
      try {
        await api.updateCaseTemplate(template.id, {
          assignedTeamMember: assign ? selectedMember : null,
        });
        await refreshTemplates();
        showToast(
          assign
            ? t('dashboard.teamsToDoTemplateAssigned', { name: template.name })
            : t('dashboard.teamsToDoTemplateUnassigned', { name: template.name }),
          'success'
        );
      } catch (error: any) {
        showToast(error.message || 'Failed to update template', 'error');
      } finally {
        setTemplateAssignLoadingId(null);
      }
    },
    [selectedMember, refreshTemplates]
  );

  const submitTeamTask = useCallback(async () => {
    if (!selectedMember) return;
    const title = taskFormTitle.trim();
    if (!title) {
      showToast(t('dashboard.teamsToDoTitleRequired'), 'error');
      return;
    }
    try {
      const created = await api.createTeamTask({
        teamMember: selectedMember,
        title,
        notes: taskFormNotes.trim() || undefined,
      });
      const task: TeamMemberTask = {
        id: created.id,
        title: created.title,
        notes: typeof created.notes === 'string' ? created.notes : '',
        done: !!created.done,
        createdAt: created.createdAt,
      };
      setTeamTasksByMember((prev) => ({
        ...prev,
        [selectedMember]: [task, ...(prev[selectedMember] || [])],
      }));
      setTaskFormTitle('');
      setTaskFormNotes('');
      setShowTaskForm(false);
      showToast(t('dashboard.teamsToDoTaskAdded'), 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save task', 'error');
    }
  }, [selectedMember, taskFormTitle, taskFormNotes]);

  if (!selectedMember) {
    return (
      <div className="min-h-[calc(100vh-6rem)] animate-fade-in">
        <div className="glass-gold rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-amber-200/60">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">{t('dashboard.teamsToDo')}</h1>
            <p className="text-amber-700 mt-2">{t('dashboard.teamsToDoSelectMember')}</p>
          </div>

          {teamTasksLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-amber-800/80">
              <div
                className="w-10 h-10 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-3"
                aria-hidden
              />
              <p className="text-sm font-medium">{t('dashboard.teamsToDoLoading')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
              {TEAM_MEMBERS.map((name) => {
                const tasks = teamTasksByMember[name] || [];
                const openCount = tasks.filter((task) => !task.done).length;
                const { templates: memberTemplates, clientCount } = memberTemplateSummary[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => openMember(name)}
                    className="flex flex-col items-stretch text-left p-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/90 to-white hover:border-amber-400 hover:shadow-lg transition-all active:scale-[0.99] min-h-[180px]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-sm">
                        <User className="w-6 h-6 text-amber-900" />
                      </div>
                      <span className="text-xl font-bold text-amber-900 tracking-wide">{name}</span>
                    </div>
                    <span className="text-sm text-amber-700/80 font-medium">
                      {t('dashboard.teamsToDoOpenTasks', { count: openCount })}
                    </span>
                    <span className="text-sm text-amber-700/80 font-medium mt-1">
                      {t('dashboard.teamsToDoTemplatesClients', {
                        templates: memberTemplates.length,
                        clients: clientCount,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const memberTasks = teamTasksByMember[selectedMember] || [];
  const memberTemplates = memberTemplateSummary[selectedMember]?.templates || [];

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col animate-fade-in -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
      <div className="sticky top-16 sm:top-20 z-40 border-b border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-100/95 to-amber-50 backdrop-blur-md shadow-sm px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={resetMemberDetail}
              className="p-2.5 text-amber-800 hover:bg-amber-200/80 rounded-xl transition-colors shrink-0"
              aria-label={t('dashboard.teamsToDoBack')}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 truncate">{selectedMember}</h1>
              <p className="text-amber-700 text-sm sm:text-base mt-0.5">
                {t('dashboard.teamsToDoMemberSubtitle')}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-semibold text-amber-800 shrink-0">
            <span>{t('dashboard.teamsToDoOpenTasks', { count: memberTasks.filter((x) => !x.done).length })}</span>
            <span className="text-amber-400">|</span>
            <span>
              {t('dashboard.teamsToDoTemplatesClients', {
                templates: memberTemplates.length,
                clients: memberTemplateSummary[selectedMember]?.clientCount || 0,
              })}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'tasks'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/80 text-amber-800 hover:bg-white border border-amber-200'
            }`}
          >
            {t('dashboard.teamsToDoTabTasks')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'templates'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/80 text-amber-800 hover:bg-white border border-amber-200'
            }`}
          >
            {t('dashboard.teamsToDoTabTemplates')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-b from-amber-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'tasks' ? (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setShowTaskForm((open) => !open)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('dashboard.teamsToDoCreateTask')}
                </button>
              </div>

              {showTaskForm ? (
                <div className="border-2 border-amber-200 rounded-2xl p-5 sm:p-6 mb-6 bg-white shadow-sm">
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-1.5">
                        {t('dashboard.teamsToDoTaskTitle')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={taskFormTitle}
                        onChange={(e) => setTaskFormTitle(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-amber-950"
                        placeholder={t('dashboard.teamsToDoTaskTitle')}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-1.5">
                        {t('dashboard.teamsToDoTaskNotes')}
                      </label>
                      <textarea
                        value={taskFormNotes}
                        onChange={(e) => setTaskFormNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-amber-950 resize-y min-h-[100px]"
                        placeholder={t('dashboard.teamsToDoTaskNotes')}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTaskForm(false);
                          setTaskFormTitle('');
                          setTaskFormNotes('');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors"
                      >
                        {t('dashboard.teamsToDoCancel')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void submitTeamTask()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-sm hover:shadow-md transition-all"
                      >
                        {t('dashboard.teamsToDoSaveTask')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {memberTasks.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-2xl bg-white/80">
                  <ListTodo className="w-16 h-16 mx-auto text-amber-300 mb-4" />
                  <p className="text-gray-600 font-medium text-lg">{t('dashboard.teamsToDoNoTasks')}</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[...memberTasks]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((task) => (
                      <li
                        key={task.id}
                        className={`flex gap-3 p-5 rounded-2xl border-2 transition-colors bg-white shadow-sm ${
                          task.done
                            ? 'border-amber-100 opacity-75'
                            : 'border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={async () => {
                            const next = !task.done;
                            setTeamTasksByMember((prev) => ({
                              ...prev,
                              [selectedMember]: prev[selectedMember].map((x) =>
                                x.id === task.id ? { ...x, done: next } : x
                              ),
                            }));
                            try {
                              await api.updateTeamTask(task.id, { done: next });
                            } catch (error: any) {
                              setTeamTasksByMember((prev) => ({
                                ...prev,
                                [selectedMember]: prev[selectedMember].map((x) =>
                                  x.id === task.id ? { ...x, done: task.done } : x
                                ),
                              }));
                              showToast(error.message || 'Failed to update task', 'error');
                            }
                          }}
                          className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                          aria-label={t('dashboard.teamsToDoMarkDone')}
                        />
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setTaskView(task)}
                            className="text-left w-full group/title"
                          >
                            <p
                              className={`font-semibold text-lg text-amber-950 group-hover/title:text-amber-700 ${
                                task.done ? 'line-through text-amber-700' : ''
                              }`}
                            >
                              {task.title}
                            </p>
                          </button>
                          {task.notes ? (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-3 break-words">{task.notes}</p>
                          ) : null}
                        </div>
                        <div className="flex items-start gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setTaskView(task)}
                            className="p-2 text-gray-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title={t('dashboard.teamsToDoViewTask')}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const prevTasks = teamTasksByMember[selectedMember];
                              setTeamTasksByMember((prev) => ({
                                ...prev,
                                [selectedMember]: prev[selectedMember].filter((x) => x.id !== task.id),
                              }));
                              try {
                                await api.deleteTeamTask(task.id);
                              } catch (error: any) {
                                setTeamTasksByMember((prev) => ({
                                  ...prev,
                                  [selectedMember]: prevTasks,
                                }));
                                showToast(error.message || 'Failed to delete task', 'error');
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete task"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-start">
              {/* Clients */}
              <section className="rounded-2xl border-2 border-amber-200 bg-white/90 shadow-sm overflow-hidden min-h-[320px] flex flex-col">
                <div className="px-5 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100/80">
                  <h2 className="text-lg font-bold text-amber-900">{t('common.clients')}</h2>
                  <p className="text-sm text-amber-700/80 mt-1">{t('dashboard.teamsToDoClickClient')}</p>
                </div>
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
                  {memberClients.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <Users className="w-12 h-12 mx-auto text-amber-300 mb-3" />
                      <p className="font-medium">{t('dashboard.teamsToDoNoClientsForMember')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {memberClients.map((client) => (
                        <TeamClientCard
                          key={client.id}
                          client={client}
                          compact
                          onClick={() => setSelectedClient(client)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Templates */}
              <section className="rounded-2xl border-2 border-amber-200 bg-white/90 shadow-sm overflow-hidden min-h-[320px] flex flex-col">
                <div className="px-5 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100/80">
                  <h2 className="text-lg font-bold text-amber-900">{t('common.templates')}</h2>
                  <p className="text-sm text-amber-700/80 mt-1">{t('dashboard.teamsToDoAssignTemplatesHint')}</p>
                </div>
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
                  <ul className="space-y-2">
                    {[...templates]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((tpl) => {
                        const assignedToMember =
                          normalizeTeamMemberName(tpl.assigned_team_member) === selectedMember;
                        const assignedElsewhere = !!tpl.assigned_team_member && !assignedToMember;
                        const loading = templateAssignLoadingId === tpl.id;
                        const clientCount = clientsByTemplateId[tpl.id]?.length || 0;
                        return (
                          <li
                            key={tpl.id}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                              assignedToMember
                                ? 'border-amber-400 bg-amber-50/80'
                                : 'border-amber-100 bg-amber-50/30 hover:bg-amber-50/60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={assignedToMember}
                              disabled={loading}
                              onChange={() => void toggleTemplateAssignment(tpl, !assignedToMember)}
                              className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 shrink-0"
                              aria-label={tpl.name}
                            />
                            <FileText className="w-5 h-5 text-amber-700 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-amber-950 truncate">{tpl.name}</p>
                              {assignedElsewhere ? (
                                <p className="text-xs text-amber-700/80 mt-0.5">
                                  {t('dashboard.teamsToDoAssignedToOther', {
                                    member: tpl.assigned_team_member || '',
                                  })}
                                </p>
                              ) : null}
                            </div>
                            <span className="text-xs font-semibold text-amber-700 shrink-0 text-right">
                              {t('dashboard.teamsToDoClientCount', { count: clientCount })}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {taskView ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTaskView(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-amber-900">{t('dashboard.teamsToDoViewTaskTitle')}</h2>
                <p className="text-sm text-amber-800/80 mt-1 font-medium">{selectedMember}</p>
              </div>
              <button
                type="button"
                onClick={() => setTaskView(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-1">
                  {t('dashboard.teamsToDoTaskTitle')}
                </p>
                <p
                  className={`text-lg font-semibold text-amber-950 ${
                    taskView.done ? 'line-through text-amber-700' : ''
                  }`}
                >
                  {taskView.title}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-1">
                  {t('dashboard.teamsToDoStatusLabel')}
                </p>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-lg text-sm font-semibold ${
                    taskView.done ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {taskView.done ? t('dashboard.teamsToDoStatusDone') : t('dashboard.teamsToDoStatusOpen')}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-1">
                  {t('dashboard.teamsToDoCreatedAt')}
                </p>
                <p className="text-sm text-gray-800">
                  {(() => {
                    try {
                      return new Date(taskView.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      });
                    } catch {
                      return taskView.createdAt;
                    }
                  })()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-1">
                  {t('dashboard.teamsToDoTaskNotes')}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg border border-amber-100 bg-amber-50/40 p-3 min-h-[3rem]">
                  {taskView.notes?.trim() ? taskView.notes : t('dashboard.teamsToDoNoNotesInView')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTaskView(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-sm hover:shadow-md transition-all"
              >
                {t('dashboard.teamsToDoCloseView')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedClient ? (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSuccess={async () => {
            setSelectedClient(null);
            await refreshClients();
          }}
        />
      ) : null}
    </div>
  );
}
