import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [outboxEmails, setOutboxEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'outbox' | 'analytics'
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Fetch initial users
  const loadUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      setCurrentUser(prev => prev || (data.find(u => u.role === 'MANAGER') || data[0]));
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message);
    }
  }, []);

  // Fetch tasks
  const loadTasks = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  // Fetch notifications for current user
  const loadNotifications = useCallback(async (userId) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return;
    try {
      const [notifs, countRes] = await Promise.all([
        api.getNotifications(targetId),
        api.getUnreadCount(targetId)
      ]);
      setNotifications(notifs);
      setUnreadCount(countRes.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [currentUser]);

  // Fetch outbox emails
  const loadOutbox = useCallback(async () => {
    try {
      const data = await api.getOutboxEmails();
      setOutboxEmails(data);
    } catch (err) {
      console.error('Failed to load outbox:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const [usersData, tasksData, outboxData] = await Promise.all([
          api.getUsers(),
          api.getTasks(),
          api.getOutboxEmails()
        ]);
        if (isMounted) {
          setUsers(usersData);
          const initialUser = usersData.find(u => u.role === 'MANAGER') || usersData[0];
          setCurrentUser(initialUser);
          setTasks(tasksData);
          setOutboxEmails(outboxData);
          if (initialUser) {
            const [notifs, countRes] = await Promise.all([
              api.getNotifications(initialUser.id),
              api.getUnreadCount(initialUser.id)
            ]);
            setNotifications(notifs);
            setUnreadCount(countRes.unreadCount || 0);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Refresh notifications whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser, loadNotifications]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadTasks(), loadNotifications(), loadOutbox()]);
  }, [loadTasks, loadNotifications, loadOutbox]);

  const registerUser = async (formData) => {
    try {
      const newUser = await api.registerUser(formData);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      showToast(`Welcome, ${newUser.fullName}! You are registered as ${newUser.role}.`, 'success');
      return newUser;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const createTask = async (payload) => {
    try {
      const newTask = await api.createTask({
        ...payload,
        managerId: currentUser.id
      });
      showToast(`Task "${newTask.title}" assigned successfully! Email notification dispatched to Mentor ${newTask.mentor.fullName} with due date.`, 'success');
      await refreshAll();
      return newTask;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const updateTaskStatus = async (taskId, status, notes) => {
    try {
      const updated = await api.updateTaskStatus(taskId, {
        status,
        notes,
        actorId: currentUser.id
      });
      if (status === 'COMPLETED') {
        showToast(`Task marked COMPLETED! Sign-off email notification sent to Manager ${updated.manager.fullName}.`, 'success');
      } else {
        showToast(`Task status updated to ${status}.`, 'info');
      }
      await refreshAll();
      return updated;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await api.markAllNotificationsRead(currentUser.id);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDeadlineCheck = async () => {
    try {
      const res = await api.triggerDeadlineReminders();
      showToast(`Deadline scan complete: ${res.remindersSent} task reminder email(s) dispatched.`, 'success');
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        tasks,
        notifications,
        unreadCount,
        outboxEmails,
        loading,
        error,
        activeTab,
        setActiveTab,
        toast,
        showToast,
        createTask,
        updateTaskStatus,
        registerUser,
        markNotificationRead,
        markAllNotificationsRead,
        triggerDeadlineCheck,
        refreshAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

