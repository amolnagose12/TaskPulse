import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Flag, User, UserCheck, Mail, Sparkles } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose }) {
  const { users, createTask } = useApp();

  const members = users.filter((u) => u.role === 'MEMBER');
  const mentors = users.filter((u) => u.role === 'MENTOR');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  // Default due date: 3 days from now
  const defaultDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '');
  const [mentorId, setMentorId] = useState(mentors[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedMentor = mentors.find((m) => m.id === Number(mentorId));
  const selectedAssignee = members.find((m) => m.id === Number(assigneeId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId || !mentorId || !dueDate) return;

    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        assigneeId: Number(assigneeId),
        mentorId: Number(mentorId)
      });
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign New Task</h3>
              <p className="text-xs text-slate-500">Assign work to a team member under mentor supervision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth2 / SSO Authentication Flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Scope
            </label>
            <textarea
              rows={3}
              placeholder="Provide context, acceptance criteria, or documentation links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Flag className="w-3.5 h-3.5 text-slate-500" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Critical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Due Date *</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Assignee (Mentee) *</span>
              </label>
              <select
                required
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Overseeing Mentor *</span>
              </label>
              <select
                required
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Automated Notification Banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-800">
            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Automated Notification Trigger:</span>
              <p className="mt-0.5 text-blue-700 leading-relaxed">
                When assigned, an email notification with the <strong>due date ({dueDate})</strong> will be automatically sent to Mentor <strong>{selectedMentor?.fullName || 'Assigned Mentor'}</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating & Dispatching...' : 'Assign & Notify Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

