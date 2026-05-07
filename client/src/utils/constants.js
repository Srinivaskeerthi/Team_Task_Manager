export const PRIORITY_COLORS = {
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  urgent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
};

export const STATUS_COLORS = {
  'todo': { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'To Do' },
  'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'In Progress' },
  'review': { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Review' },
  'completed': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Completed' },
};

export const PROJECT_STATUS = {
  planning: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Planning' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Active' },
  'on-hold': { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'On Hold' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Completed' },
  archived: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Archived' },
};

export const TASK_STATUSES = ['todo', 'in-progress', 'review', 'completed'];
