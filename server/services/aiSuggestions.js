// AI-powered smart suggestion service (rule-based, no external API needed)

export const suggestPriority = (task) => {
  const now = new Date();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  if (!dueDate) return 'medium';
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  if (daysUntilDue <= 1) return 'urgent';
  if (daysUntilDue <= 3) return 'high';
  if (daysUntilDue <= 7) return 'medium';
  return 'low';
};

export const suggestDeadline = (priority) => {
  const now = new Date();
  const daysMap = { urgent: 1, high: 3, medium: 7, low: 14 };
  const days = daysMap[priority] || 7;
  now.setDate(now.getDate() + days);
  return now.toISOString().split('T')[0];
};

export const suggestAssignee = (members, tasks) => {
  if (!members || members.length === 0) return null;
  const workload = {};
  members.forEach(m => { workload[m.user?._id || m.user] = 0; });
  tasks.forEach(t => {
    if (t.assignedTo && t.status !== 'completed') {
      const id = t.assignedTo._id || t.assignedTo;
      workload[id] = (workload[id] || 0) + 1;
    }
  });
  let minLoad = Infinity;
  let suggested = null;
  Object.entries(workload).forEach(([userId, load]) => {
    if (load < minLoad) { minLoad = load; suggested = userId; }
  });
  return suggested;
};

export const generateTaskSuggestions = (task, projectTasks, members) => {
  return {
    suggestedPriority: suggestPriority(task),
    suggestedDeadline: suggestDeadline(task.priority || 'medium'),
    suggestedAssignee: suggestAssignee(members, projectTasks),
    tips: generateTips(task),
  };
};

const generateTips = (task) => {
  const tips = [];
  if (!task.description) tips.push('Add a description to improve clarity');
  if (!task.dueDate) tips.push('Setting a due date helps track progress');
  if (!task.checklist || task.checklist.length === 0) tips.push('Break this task into smaller checklist items');
  if (task.priority === 'urgent') tips.push('Consider assigning this to your most available team member');
  return tips;
};
