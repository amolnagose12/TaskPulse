const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Users
  getUsers: (role) => request(`/users${role ? `?role=${role}` : ''}`),
  getUserById: (id) => request(`/users/${id}`),
  registerUser: (data) => request('/users/register', { method: 'POST', body: JSON.stringify(data) }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params.mentorId) query.append('mentorId', params.mentorId);
    if (params.managerId) query.append('managerId', params.managerId);
    const queryString = query.toString();
    return request(`/tasks${queryString ? `?${queryString}` : ''}`);
  },
  getTaskById: (id) => request(`/tasks/${id}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTaskStatus: (id, data) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTaskAuditLogs: (id) => request(`/tasks/${id}/audit-logs`),
  triggerDeadlineReminders: () => request('/tasks/trigger-deadline-reminders', { method: 'POST' }),

  // Notifications
  getNotifications: (userId) => request(`/notifications?userId=${userId}`),
  getUnreadCount: (userId) => request(`/notifications/unread-count?userId=${userId}`),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (userId) => request(`/notifications/mark-all-read?userId=${userId}`, { method: 'POST' }),

  // Outbox Emails
  getOutboxEmails: (taskId) => request(`/emails/outbox${taskId ? `?taskId=${taskId}` : ''}`),
};

