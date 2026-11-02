import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Flag, 
  History, 
  Play, 
  RotateCcw,
  ShieldCheck,
  UserCheck,
  User
} from 'lucide-react';
import MentorStatusModal from './MentorStatusModal';
import TaskAuditModal from './TaskAuditModal';

export default function KanbanBoard() {
  const { tasks, currentUser, updateTaskStatus } = useApp();
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);
  const [selectedTaskForAudit, setSelectedTaskForAudit] = useState(null);

  const columns = [
    { id: 'PENDING', title: 'Pending Kickoff', icon: Clock, color: 'border-slate-300 bg-slate-50/50' },
    { id: 'IN_PROGRESS', title: 'In Progress (Mentored)', icon: Play, color: 'border-blue-300 bg-blue-50/30' },
    { id: 'COMPLETED', title: 'Completed & Signed Off', icon: CheckCircle2, color: 'border-emerald-300 bg-emerald-50/30' },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1"><Flag className="w-2.5 h-2.5" /><span>URGENT</span></span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1"><Flag className="w-2.5 h-2.5" /><span>HIGH</span></span>;
      case 'MEDIUM':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">MEDIUM</span>;
      case 'LOW':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">LOW</span>;
      default:
        return null;
    }
  };

  const getDueDateDisplay = (task) => {
    const isOverdue = task.overdue;
    const dueDateStr = new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (task.status === 'COMPLETED') {
      return (
        <span className="text-emerald-600 text-[11px] font-medium flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Completed</span>
        </span>
      );
    }

    if (isOverdue) {
      return (
        <span className="text-rose-600 font-bold text-[11px] flex items-center space-x-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <AlertCircle className="w-3 h-3" />
          <span>Overdue: {dueDateStr}</span>
        </span>
      );
    }

    return (
      <span className="text-slate-500 text-[11px] font-medium flex items-center space-x-1">
        <Calendar className="w-3 h-3 text-slate-400" />
        <span>Due: {dueDateStr}</span>
      </span>
    );
  };

  // Check if current user is authorized to update status (Mentor of this task or Manager)
  const canUpdateStatus = (task) => {
    if (!currentUser) return false;
    if (currentUser.role === 'MANAGER') return true;
    return currentUser.role === 'MENTOR' && task.mentor.id === currentUser.id;
  };

  const handleOpenStatusModal = (task, nextStatus) => {
    setSelectedTaskForStatus(task);
    setTargetStatus(nextStatus);
  };

  return (
    <div className="space-y-6">
      {/* Board Header / Explanatory Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Mentorship Guarded Flow
            </span>
            <span className="text-xs text-blue-200">&bull; 3-Tier Authority</span>
          </div>
          <h2 className="text-xl font-bold mt-1">Team Task Lifecycle Board</h2>
          <p className="text-xs text-blue-100 max-w-2xl mt-1 leading-relaxed">
            Managers assign tasks with due dates to team members. 
            <strong> Mentors receive immediate email notification with the due date</strong> and have explicit authority to transition tasks through 
            <code>PENDING</code> → <code>IN_PROGRESS</code> → <code>COMPLETED</code>. 
            When completed, <strong>the manager gets an automated sign-off email</strong>.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-semibold text-white">Active User: {currentUser?.fullName}</div>
            <div className="text-[11px] text-blue-200">
              Role: <strong className="text-emerald-300">{currentUser?.role}</strong> 
              {currentUser?.role === 'MENTOR' ? ' (Can update assigned tasks)' : currentUser?.role === 'MANAGER' ? ' (Full Admin)' : ' (Mentee View)'}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const ColIcon = col.icon;

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[600px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
                <div className="flex items-center space-x-2">
                  <ColIcon className="w-4 h-4 text-slate-700" />
                  <h3 className="font-bold text-sm text-slate-800">{col.title}</h3>
                </div>
                <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400 italic">
                    No tasks in {col.title.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isAuthorized = canUpdateStatus(task);

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition duration-150 flex flex-col justify-between"
                      >
                        <div>
                          {/* Priority & Due Date Header */}
                          <div className="flex items-center justify-between mb-2">
                            {getPriorityBadge(task.priority)}
                            {getDueDateDisplay(task)}
                          </div>

                          {/* Task Title & Description */}
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Mentor Review Notes if any */}
                          {task.mentorNotes && (
                            <div className="mt-2.5 p-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600">
                              <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">
                                Mentor Sign-Off Notes:
                              </span>
                              "{task.mentorNotes}"
                            </div>
                          )}

                          {/* Member and Mentor Avatars */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            {/* Mentee (Assignee) */}
                            <div className="flex items-center space-x-1.5" title={`Assignee: ${task.assignee.fullName}`}>
                              <img
                                src={task.assignee.avatarUrl}
                                alt={task.assignee.fullName}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-[11px] font-medium text-slate-700">{task.assignee.fullName}</span>
                            </div>

                            {/* Overseeing Mentor */}
                            <div 
                              className="flex items-center space-x-1 text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100 font-medium"
                              title={`Mentor: ${task.mentor.fullName}`}
                            >
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>{task.mentor.fullName.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedTaskForAudit(task)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="View Status History & Audit Log"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Mentor-Guarded Status Actions */}
                          {isAuthorized ? (
                            <div className="flex items-center space-x-1.5">
                              {col.id === 'PENDING' && (
                                <button
                                  onClick={() => handleOpenStatusModal(task, 'IN_PROGRESS')}
                                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Start Task</span>
                                </button>
                              )}

                              {col.id === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleOpenStatusModal(task, 'COMPLETED')}
                                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Complete &amp; Notify Manager</span>
                                </button>
                              )}

                              {col.id === 'COMPLETED' && (
                                <button
                                  onClick={() => handleOpenStatusModal(task, 'PENDING')}
                                  className="flex items-center space-x-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Reopen</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Mentor approval required
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedTaskForStatus && (
        <MentorStatusModal
          isOpen={!!selectedTaskForStatus}
          onClose={() => setSelectedTaskForStatus(null)}
          task={selectedTaskForStatus}
          targetStatus={targetStatus}
        />
      )}

      {selectedTaskForAudit && (
        <TaskAuditModal
          isOpen={!!selectedTaskForAudit}
          onClose={() => setSelectedTaskForAudit(null)}
          task={selectedTaskForAudit}
        />
      )}
    </div>
  );
}

