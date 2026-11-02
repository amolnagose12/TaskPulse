import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, History, User, Clock, ArrowRight } from 'lucide-react';

export default function TaskAuditModal({ isOpen, onClose, task }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && task) {
      setLoading(true);
      api.getTaskAuditLogs(task.id)
        .then((data) => setLogs(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Task Audit Trail</h3>
              <p className="text-xs text-slate-500">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading audit history...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No audit logs recorded.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{log.actor?.fullName} ({log.actor?.role})</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center space-x-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                      {log.previousStatus || 'CREATED'}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[11px] font-semibold">
                      {log.newStatus}
                    </span>
                  </div>

                  {log.notes && (
                    <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

