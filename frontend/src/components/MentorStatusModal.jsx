import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, Clock, AlertCircle, Mail, MessageSquare } from 'lucide-react';

export default function MentorStatusModal({ isOpen, onClose, task, targetStatus }) {
  const { updateTaskStatus, currentUser } = useApp();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateTaskStatus(task.id, targetStatus, notes.trim());
      onClose();
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleting = targetStatus === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isCompleting ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2">
            {isCompleting ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isCompleting ? 'Sign-off & Complete Task' : `Update Status: ${targetStatus}`}
              </h3>
              <p className="text-xs text-slate-500">Mentor status transition review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block">Task:</span>
            <span className="text-slate-900 font-medium text-sm">{task.title}</span>
            <div className="mt-2 text-slate-500 flex items-center justify-between">
              <span>Mentee: <strong>{task.assignee.fullName}</strong></span>
              <span>Due: <strong>{task.dueDate}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Mentor Feedback &amp; Review Remarks</span>
            </label>
            <textarea
              rows={3}
              required={isCompleting}
              placeholder={isCompleting ? "Summarize deliverables, review outcome, or PR verification..." : "Add optional progress notes..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {isCompleting && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-900">
              <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Manager Email Trigger:</span>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Completing this task will immediately trigger an automated email reminder to 
                  <strong> {task.manager.fullName} ({task.manager.email})</strong> with your review sign-off.
                </p>
              </div>
            </div>
          )}

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
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition disabled:opacity-50 ${
                isCompleting 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Updating...' : (isCompleting ? 'Sign-off & Notify Manager' : 'Update Status')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

