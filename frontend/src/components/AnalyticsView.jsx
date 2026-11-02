import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Award, 
  ShieldAlert,
  BarChart3
} from 'lucide-react';

export default function AnalyticsView() {
  const { tasks, users } = useApp();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter((t) => t.overdue).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const mentors = users.filter((u) => u.role === 'MENTOR');

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all team tracks</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{inProgressTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">Under active mentorship</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{completionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{completedTasks} verified &amp; signed off</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{overdueTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">Require immediate follow-up</div>
        </div>
      </div>

      {/* Mentorship Workload & Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mentor Oversight Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Mentor Supervised Workload</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Active tasks overseen by designated mentors</p>

          <div className="mt-4 space-y-4">
            {mentors.map((mentor) => {
              const mentoredTasks = tasks.filter((t) => t.mentor.id === mentor.id);
              const completedCount = mentoredTasks.filter((t) => t.status === 'COMPLETED').length;
              const inProgressCount = mentoredTasks.filter((t) => t.status === 'IN_PROGRESS').length;

              return (
                <div key={mentor.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-800">{mentor.fullName}</div>
                        <div className="text-[10px] text-slate-400">{mentor.department}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {mentoredTasks.length} tasks
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center space-x-4 text-[11px] text-slate-500">
                    <span>In Progress: <strong className="text-blue-600">{inProgressCount}</strong></span>
                    <span>Completed: <strong className="text-emerald-600">{completedCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Compliance & Quality Assurance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>System Workflow Rules &amp; SLA</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Key business policies enforced by TaskPulse</p>

          <div className="mt-4 space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <strong className="text-blue-900 block font-semibold mb-1">1. Due Date Mentor Notification</strong>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Whenever a task is created, the system sends an email to the assigned mentor with the due date. The mentor is briefed before work begins.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <strong className="text-emerald-900 block font-semibold mb-1">2. Mentor Sign-Off Gatekeeper</strong>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Only the assigned mentor or manager has permission to transition tasks between <code>PENDING</code>, <code>IN_PROGRESS</code>, and <code>COMPLETED</code>.
              </p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
              <strong className="text-amber-900 block font-semibold mb-1">3. Automated Manager Sign-Off Email</strong>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                When a task is marked <code>COMPLETED</code>, an email is dispatched to the manager (You) summarizing the mentor's verification notes and completion timestamp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

