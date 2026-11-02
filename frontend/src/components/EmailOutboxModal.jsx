import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, CheckCircle, Clock, AlertTriangle, ExternalLink, RefreshCw, X, Eye } from 'lucide-react';

export default function EmailOutboxView() {
  const { outboxEmails, refreshAll } = useApp();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const filteredEmails = outboxEmails.filter((email) => {
    if (filter === 'ALL') return true;
    return email.triggerEvent === filter;
  });

  const getTriggerBadge = (event) => {
    switch (event) {
      case 'TASK_ASSIGNED_TO_MENTOR':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium">Mentor Due Date Notice</span>;
      case 'TASK_COMPLETED_TO_MANAGER':
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium">Manager Completion Alert</span>;
      case 'DEADLINE_REMINDER_TO_MENTOR':
      case 'DEADLINE_REMINDER_TO_ASSIGNEE':
        return <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-medium">Deadline Reminder</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">{event}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Live Email Notification Outbox</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit log of all automated emails dispatched by Spring Boot (Task Assignment with Due Date &bull; Mentor Sign-off Reminders).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Triggers ({outboxEmails.length})</option>
            <option value="TASK_ASSIGNED_TO_MENTOR">Mentor Assignment Notice</option>
            <option value="TASK_COMPLETED_TO_MANAGER">Manager Completion Alert</option>
            <option value="DEADLINE_REMINDER_TO_MENTOR">Deadline Reminders</option>
          </select>

          <button
            onClick={refreshAll}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refresh outbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Outbox Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredEmails.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No email notifications in this category yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Event Trigger</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{email.recipientName || email.recipientEmail}</div>
                      <div className="text-[11px] text-slate-400">{email.recipientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {email.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      {getTriggerBadge(email.triggerEvent)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{email.deliveryStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(email.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect HTML</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HTML Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-blue-400 block">Outbound HTML Email Preview</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedEmail.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;</div>
              <div><strong>Trigger:</strong> {selectedEmail.triggerEvent} | <strong>Status:</strong> {selectedEmail.deliveryStatus}</div>
            </div>

            <div className="p-6 max-h-[500px] overflow-y-auto bg-slate-50">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
              />
            </div>

            <div className="px-6 py-3 bg-white border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

